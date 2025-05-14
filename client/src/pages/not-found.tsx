import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">404</h1>
          <h2 className="text-xl font-medium sm:text-2xl md:text-3xl">Page Not Found</h2>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed">
            We couldn't find the page you were looking for. Please check the URL and try again.
          </p>
        </div>
        <div className="mx-auto max-w-[600px] space-x-4">
          <Button asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}