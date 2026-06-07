"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SiteConfigSchema } from "@mw/types";
import type { SiteConfig } from "@mw/types";
import { updateSiteConfigAction } from "@/app/actions/settings.actions";

type FormData = Omit<SiteConfig, "updatedAt" | "updatedBy">;

export function SiteConfigForm({ config }: { config: SiteConfig | null }) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(SiteConfigSchema.omit({ updatedAt: true, updatedBy: true }) as any),
    defaultValues: config ?? {
      id: "main",
      whatsappNumber: "",
      socials: { youtube: "", instagram: "", substack: "" },
      youtube: { channelId: "", featuredVideoIds: [], channels: { en: "", bn: "", hi: "" } },
      featured: { articleIds: [], bookIds: [] },
    },
  });

  const submit = (data: FormData) => {
    startTransition(async () => {
      const result = await updateSiteConfigAction(data);
      if (result.ok) toast.success("Settings saved");
      else toast.error(result.error ?? "Failed to save");
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-text mb-1.5">
          WhatsApp Number <span className="text-xs text-muted">(international format, no +)</span>
        </label>
        <input id="whatsapp" {...register("whatsappNumber")} className="field" placeholder="919876543210" />
        {errors.whatsappNumber && <p className="field-error">{errors.whatsappNumber.message}</p>}
      </div>

      <fieldset className="space-y-3 border border-border rounded-md p-4">
        <legend className="text-sm font-medium text-text px-1">Social Links</legend>
        <div>
          <label htmlFor="yt-social" className="block text-xs text-muted mb-1">YouTube Channel URL</label>
          <input id="yt-social" type="url" {...register("socials.youtube")} className="field" placeholder="https://youtube.com/@channel" />
        </div>
        <div>
          <label htmlFor="ig" className="block text-xs text-muted mb-1">Instagram URL</label>
          <input id="ig" type="url" {...register("socials.instagram")} className="field" />
        </div>
        <div>
          <label htmlFor="substack" className="block text-xs text-muted mb-1">Substack URL</label>
          <input id="substack" type="url" {...register("socials.substack")} className="field" />
        </div>
      </fieldset>

      <fieldset className="space-y-3 border border-border rounded-md p-4">
        <legend className="text-sm font-medium text-text px-1">YouTube Channels</legend>
        <p className="text-xs text-muted -mt-1">
          Enter the channel IDs (e.g. <span className="font-mono text-xs">UCxxxxxxxxxxxxxxxx</span>) used for syncing videos.
          Find it at youtube.com/channel/&lt;ID&gt; or in YouTube Studio → Settings → Channel → Advanced.
        </p>
        <p className="text-xs text-muted">
          Also ensure <span className="font-mono text-xs">YOUTUBE_API_KEY</span> is set in your{" "}
          <span className="font-mono text-xs">.env.local</span> (Google Cloud Console → YouTube Data API v3).
        </p>
        <div>
          <label htmlFor="yt-channel-en" className="block text-xs text-muted mb-1">English Channel ID</label>
          <input id="yt-channel-en" {...register("youtube.channels.en")} className="field font-mono" placeholder="UCxxxxxxxxxxxxxxxx" />
        </div>
        <div>
          <label htmlFor="yt-channel-bn" className="block text-xs text-muted mb-1">Bengali Channel ID</label>
          <input id="yt-channel-bn" {...register("youtube.channels.bn")} className="field font-mono" placeholder="UCxxxxxxxxxxxxxxxx" />
        </div>
        <div>
          <label htmlFor="yt-channel-hi" className="block text-xs text-muted mb-1">Hindi Channel ID</label>
          <input id="yt-channel-hi" {...register("youtube.channels.hi")} className="field font-mono" placeholder="UCxxxxxxxxxxxxxxxx" />
        </div>
      </fieldset>

      <div className="flex justify-end">
        <button type="submit" disabled={isPending} className="h-9 px-5 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {isPending ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
