export default function Footer(
  { creditsUrl }: {
    creditsUrl: string
  }
) {
    return (
        <footer className="flex items-center justify-between px-8 pb-4">
          <a
            className="hover:underline hover:underline-offset-4 cursor-pointer"
            href={creditsUrl}
          >
            Created by Owen Gallagher &lt;github.com/ogallagher&gt;
          </a>
        </footer>
    )
}