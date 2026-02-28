import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../src/lib/firebase";
import { Link } from "react-router-dom";
import {
  Loader2,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { cn } from "../components/ui-primitives";

export interface BlogPostType {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image: string;
}

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    author: "",
    category: "",
    image: "",
  });

  const fetchPosts = async () => {
    try {
      const blogsCol = collection(db, "blogs");
      const q = query(blogsCol, orderBy("date", "desc"));
      const snapshot = await getDocs(q);

      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPostType[];

      setPosts(fetchedPosts);
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
      setError(
        "Failed to load blog posts. Please check your database permissions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slugToUse =
        newPost.slug.trim() ||
        newPost.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");
      const postRef = doc(db, "blogs", slugToUse);
      await setDoc(postRef, {
        ...newPost,
        slug: slugToUse,
      });
      setIsModalOpen(false);
      setNewPost({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        author: "",
        category: "",
        image: "",
      });
      await fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to create post. Check console and permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await deleteDoc(doc(db, "blogs", id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Loading articles…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[hsl(var(--background))] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              Trending Motion Blog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold border border-[hsl(var(--primary))]/20">
              {posts.length} Posts
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus size={18} />
            Add New Post
          </button>
        </div>
        <p className="text-[hsl(var(--muted-foreground))] max-w-2xl text-lg">
          Insights, updates, and tutorials from the Trending Motion team.
        </p>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-sm">
            {error}
          </div>
        )}
      </div>

      {posts.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]/50">
          <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
            No posts yet
          </h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            Click the "Add New Post" button above to publish your first article.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug || post.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary))]/30 h-full"
            >
              {post.image && (
                <div className="aspect-video w-full overflow-hidden bg-[hsl(var(--muted))] border-b border-[hsl(var(--card-border))]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="flex flex-col flex-1 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/20 uppercase tracking-widest">
                    {post.category || "General"}
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--foreground))]">
                      {post.author ? post.author.charAt(0).toUpperCase() : "E"}
                    </div>
                    <span className="text-xs font-medium text-[hsl(var(--foreground))]">
                      {post.author || "Trending Motion"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleDeletePost(e, post.id)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors bg-[hsl(var(--muted))]/50 hover:bg-red-500/10 p-1.5 rounded-md"
                      title="Delete Post"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-1 text-[hsl(var(--primary))] text-xs font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Read</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Post Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] shrink-0">
                <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                  Create New Blog Post
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form
                  id="add-post-form"
                  onSubmit={handleAddPost}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Title *
                      </label>
                      <input
                        required
                        type="text"
                        value={newPost.title}
                        onChange={(e) =>
                          setNewPost({ ...newPost, title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-all font-medium py-2.5"
                        placeholder="e.g. The Future of AI"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Slug (Optional)
                      </label>
                      <input
                        type="text"
                        value={newPost.slug}
                        onChange={(e) =>
                          setNewPost({ ...newPost, slug: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 py-2.5"
                        placeholder="e.g. future-of-ai"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      Excerpt *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={newPost.excerpt}
                      onChange={(e) =>
                        setNewPost({ ...newPost, excerpt: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 py-2.5"
                      placeholder="Short summary for the card..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={newPost.image}
                      onChange={(e) =>
                        setNewPost({ ...newPost, image: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 py-2.5"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Category
                      </label>
                      <input
                        type="text"
                        value={newPost.category}
                        onChange={(e) =>
                          setNewPost({ ...newPost, category: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 py-2.5"
                        placeholder="e.g. Technology"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Author
                      </label>
                      <input
                        type="text"
                        value={newPost.author}
                        onChange={(e) =>
                          setNewPost({ ...newPost, author: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 py-2.5"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newPost.date}
                      onChange={(e) =>
                        setNewPost({ ...newPost, date: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 [color-scheme:light] dark:[color-scheme:dark] py-2.5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                      Content *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost({ ...newPost, content: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 font-mono py-2.5 leading-relaxed"
                      placeholder="Full post content (supports newlines)..."
                    />
                  </div>
                </form>
              </div>
              <div className="px-6 py-4 border-t border-[hsl(var(--border))] shrink-0 flex items-center justify-end gap-3 bg-[hsl(var(--muted))]/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors border border-transparent hover:border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--card))]"
                >
                  Cancel
                </button>
                <button
                  form="add-post-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
