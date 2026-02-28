import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../src/lib/firebase";
import { Loader2, Save, Globe, LogOut } from "lucide-react";

export interface SEOSettings {
  // Global Meta
  title: string;
  description: string;
  keywords: string;
  author: string;

  // Open Graph / Social Media
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterHandle: string;

  // Additional SEO & Tracking configs
  targetAudience: string;
  canonicalUrl: string;
  robotsTxt: string;
  googleAnalyticsId: string;
}

export const SEO: React.FC = () => {
  const [settings, setSettings] = useState<SEOSettings>({
    title: "",
    description: "",
    keywords: "",
    author: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterHandle: "",
    targetAudience: "",
    canonicalUrl: "",
    robotsTxt: "index, follow",
    googleAnalyticsId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const seoDoc = await getDoc(doc(db, "settings", "seo"));
        if (seoDoc.exists()) {
          setSettings(seoDoc.data() as SEOSettings);
        }
      } catch (err) {
        console.error("Error fetching SEO settings:", err);
        setError(
          "Failed to load SEO settings. Please check your database permissions.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await setDoc(doc(db, "settings", "seo"), settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving SEO settings:", err);
      setError("Failed to save SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-3.5rem)] bg-[hsl(var(--background))] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-[hsl(var(--primary))]" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              SEO Settings
            </h1>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors border border-red-100 whitespace-nowrap"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
        <p className="text-[hsl(var(--muted-foreground))] max-w-2xl text-lg">
          Manage your global SEO settings. These values can be accessed by your
          landing page to improve search engine rankings.
        </p>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-4 rounded-xl bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900/50 text-sm">
            Settings saved successfully!
          </div>
        )}
      </div>

      <div className="max-w-3xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-[hsl(var(--border))] pb-2 text-[hsl(var(--foreground))]">
              General SEO Meta
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Site Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) =>
                  setSettings({ ...settings, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                placeholder="e.g. Trending Motion - Best CRM"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                The main title for your website, shown in browser tabs and
                search engine results.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow resize-none"
                placeholder="A brief description of your site..."
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Recommended length: 150-160 characters. This often appears under
                the title in search results.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Meta Keywords
              </label>
              <input
                type="text"
                value={settings.keywords}
                onChange={(e) =>
                  setSettings({ ...settings, keywords: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                placeholder="e.g. CRM, software, business, trending motion"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Comma-separated list of relevant keywords. Note: Google relies
                less on this nowadays.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Author
                </label>
                <input
                  type="text"
                  value={settings.author}
                  onChange={(e) =>
                    setSettings({ ...settings, author: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                  placeholder="e.g. John Doe / Trending Motion"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={settings.targetAudience}
                  onChange={(e) =>
                    setSettings({ ...settings, targetAudience: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                  placeholder="e.g. Business Owners, Developers"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-bold border-b border-[hsl(var(--border))] pb-2 text-[hsl(var(--foreground))]">
              Social Media & Open Graph
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  OG Title
                </label>
                <input
                  type="text"
                  value={settings.ogTitle}
                  onChange={(e) =>
                    setSettings({ ...settings, ogTitle: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                  placeholder="Usually same as Site Title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  value={settings.twitterHandle}
                  onChange={(e) =>
                    setSettings({ ...settings, twitterHandle: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                  placeholder="e.g. @trendingmotion"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                OG Description
              </label>
              <textarea
                rows={2}
                value={settings.ogDescription}
                onChange={(e) =>
                  setSettings({ ...settings, ogDescription: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow resize-none"
                placeholder="Usually same as Meta Description"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Open Graph (OG) Image URL
              </label>
              <input
                type="url"
                value={settings.ogImage}
                onChange={(e) =>
                  setSettings({ ...settings, ogImage: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Used when link is shared on Twitter, Facebook, LinkedIn,
                iMessage etc. Recommended size: 1200x630.
              </p>
            </div>

            {settings.ogImage && (
              <div className="pt-2">
                <span className="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">
                  Image Preview
                </span>
                <img
                  src={settings.ogImage}
                  alt="OG Preview"
                  className="w-full max-h-60 rounded-xl border border-[hsl(var(--border))] shadow-sm object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-bold border-b border-[hsl(var(--border))] pb-2 text-[hsl(var(--foreground))]">
              Technical SEO & Tracking
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={settings.canonicalUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, canonicalUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                  placeholder="e.g. https://www.trendingmotion.com"
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Helps prevent duplicate content issues.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Robots Meta Tag
                </label>
                <input
                  type="text"
                  value={settings.robotsTxt}
                  onChange={(e) =>
                    setSettings({ ...settings, robotsTxt: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                  placeholder="e.g. index, follow"
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  "index, follow" lets search engines crawl and display your
                  site.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Google Analytics ID (Optional)
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    googleAnalyticsId: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-shadow"
                placeholder="e.g. G-XXXXXXXXXX"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Used for embedding Google Analytics tags dynamically on your
                landing page.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[hsl(var(--border))] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
