import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../src/lib/firebase";
import { Loader2, ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { BlogPostType } from "./Blog";

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const blogsRef = collection(db, "blogs");
        const q = query(blogsRef, where("slug", "==", slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Alternatively, let's try querying by document ID if slug doesn't match
          try {
            const fallbackQuery = query(collection(db, "blogs"));
            const fallbackSnapshot = await getDocs(fallbackQuery);
            const foundDoc = fallbackSnapshot.docs.find(
              (doc) => doc.id === slug,
            );

            if (foundDoc) {
              setPost({ id: foundDoc.id, ...foundDoc.data() } as BlogPostType);
            } else {
              setError("Blog post not found.");
            }
          } catch (e) {
            setError("Blog post not found.");
          }
        } else {
          const doc = querySnapshot.docs[0];
          setPost({ id: doc.id, ...doc.data() } as BlogPostType);
        }
      } catch (err: any) {
        console.error("Error fetching post:", err);
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Loading article…
          </p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
            Oops!
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
            {error || "Post not found."}
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[hsl(var(--background))]">
      {/* Banner Image */}
      {post.image && (
        <div className="w-full h-[30vh] sm:h-[40vh] md:h-[50vh] relative max-w-6xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg border border-[hsl(var(--card-border))]">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 sm:p-10 pointer-events-none rounded-3xl">
              {/* Optional: Add content inside image if desired */}
            </div>
          </div>
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors mb-8 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to all articles
        </Link>

        <header className="mb-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/20 uppercase tracking-widest">
              <Tag size={12} />
              {post.category || "General"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-[hsl(var(--muted-foreground))] pt-4 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-center font-bold text-[hsl(var(--foreground))]">
                {post.author ? post.author.charAt(0).toUpperCase() : "E"}
              </div>
              <span className="font-medium text-[hsl(var(--foreground))]">
                {post.author || "Trending Motion"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="opacity-70" />
              <span>
                {post.date
                  ? new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently"}
              </span>
            </div>
          </div>
        </header>

        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none text-[hsl(var(--foreground))]/90 leading-relaxed font-serif">
          {/* If the content is simple text, render paragraphs. If it's HTML, we'll need dangerouslySetInnerHTML. 
              assuming plain text with newlines for now. */}
          {post.content ? (
            <div className="space-y-6">
              {post.content
                .split("\n")
                .map((paragraph, idx) =>
                  paragraph.trim() ? <p key={idx}>{paragraph}</p> : null,
                )}
            </div>
          ) : (
            <p className="italic text-[hsl(var(--muted-foreground))]">
              No content available for this post.
            </p>
          )}
        </div>
      </article>
    </div>
  );
};
