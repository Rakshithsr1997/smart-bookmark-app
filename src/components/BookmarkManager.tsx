"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
}

export default function BookmarkManager({ userId }: { userId: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)

    if (!error && data) {
      setBookmarks(data)
    }
  }

  useEffect(() => {
  if (!userId) return

  // Initial load
  fetchBookmarks()

  const channel = supabase
    .channel(`realtime-bookmarks-${userId}`)

    // Handle INSERT
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "bookmarks",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const newBookmark = payload.new as Bookmark
        setBookmarks((prev) => [...prev, newBookmark])
      }
    )

    //  Handle DELETE
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "bookmarks",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const deletedId = payload.old.id
        setBookmarks((prev) =>
          prev.filter((bookmark) => bookmark.id !== deletedId)
        )
      }
    )

    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId])


  const addBookmark = async () => {
    if (!title.trim() || !url.trim()) return

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: userId,
      },
    ])

    setTitle("")
    setUrl("")
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
  }

  return (
    <div className="w-full max-w-xl space-y-6 mt-6">
      <div className="space-y-2">
        <input
          className="w-full border p-2 rounded"
          placeholder="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={addBookmark}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Bookmark
        </button>
      </div>

      <div className="space-y-3">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {bookmark.title}
            </a>

            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}