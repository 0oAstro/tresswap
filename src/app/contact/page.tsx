import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "contact - hairify",
  description: "get in touch about acquisition prospects or collaborations",
};

export default function ContactPage() {
  return (
    <div className="container py-10 mx-auto">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            let&aptos;s connect
          </h1>
          <p className="text-muted-foreground">
            reach out to discuss acquisition prospects or collaborations
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">contact info</CardTitle>
            <CardDescription className="text-center">
              feel free to reach out through any of these channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="mailto:astro.ee124@iitd.ac.in"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted"
            >
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>astro.ee124@iitd.ac.in</span>
            </a>

            <a
              href="https://x.com/0oastro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted"
            >
              <Twitter className="h-5 w-5 text-muted-foreground" />
              <span>x.com/0oastro</span>
            </a>

            <a
              href="https://github.com/0oastro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted"
            >
              <Github className="h-5 w-5 text-muted-foreground" />
              <span>github.com/0oastro</span>
            </a>

            <a
              href="https://linkedin.com/in/sps1010"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted"
            >
              <Linkedin className="h-5 w-5 text-muted-foreground" />
              <span>linkedin.com/in/sps1010</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
