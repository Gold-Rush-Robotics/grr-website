import { Typography } from "@/app/_components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-12 p-8">
      <div>
        <Typography variant="h1">Theme Playground</Typography>
        <Typography variant="lead" className="mt-4">
          Test and preview all theme colors and typography variants
        </Typography>
      </div>

      {/* Typography Section */}
      <section className="space-y-6">
        <Typography variant="h2">Typography</Typography>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Typography variant="h1">Heading 1</Typography>
              <code className="text-muted-foreground text-xs">
                variant="h1"
              </code>
            </div>
            <div>
              <Typography variant="h2">Heading 2</Typography>
              <code className="text-muted-foreground text-xs">
                variant="h2"
              </code>
            </div>
            <div>
              <Typography variant="h3">Heading 3</Typography>
              <code className="text-muted-foreground text-xs">
                variant="h3"
              </code>
            </div>
            <div>
              <Typography variant="h4">Heading 4</Typography>
              <code className="text-muted-foreground text-xs">
                variant="h4"
              </code>
            </div>
            <div>
              <Typography variant="h5">Heading 5</Typography>
              <code className="text-muted-foreground text-xs">
                variant="h5"
              </code>
            </div>
            <div>
              <Typography variant="h6">Heading 6</Typography>
              <code className="text-muted-foreground text-xs">
                variant="h6"
              </code>
            </div>
            <div>
              <Typography variant="p">
                This is a paragraph. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </Typography>
              <code className="text-muted-foreground text-xs">variant="p"</code>
            </div>
            <div>
              <Typography variant="lead">
                This is a lead paragraph with larger text and muted color.
              </Typography>
              <code className="text-muted-foreground text-xs">
                variant="lead"
              </code>
            </div>
            <div>
              <Typography variant="large">Large text</Typography>
              <code className="text-muted-foreground text-xs">
                variant="large"
              </code>
            </div>
            <div>
              <Typography variant="small">Small text</Typography>
              <code className="text-muted-foreground text-xs">
                variant="small"
              </code>
            </div>
            <div>
              <Typography variant="muted">
                This is muted text for secondary information.
              </Typography>
              <code className="text-muted-foreground text-xs">
                variant="muted"
              </code>
            </div>
            <div>
              <Typography variant="blockquote">
                "This is a blockquote. It has a left border and italic styling."
              </Typography>
              <code className="text-muted-foreground text-xs">
                variant="blockquote"
              </code>
            </div>
            <div>
              <Typography variant="code">const example = "code";</Typography>
              <code className="text-muted-foreground text-xs">
                variant="code"
              </code>
            </div>
            <div>
              <Typography variant="p">
                Inline <Typography variant="inlineCode">code</Typography>{" "}
                example
              </Typography>
              <code className="text-muted-foreground text-xs">
                variant="inlineCode"
              </code>
            </div>
            <div>
              <Typography variant="list">
                <li>List item one</li>
                <li>List item two</li>
                <li>List item three</li>
              </Typography>
              <code className="text-muted-foreground text-xs">
                variant="list"
              </code>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Color Palette Section */}
      <section className="space-y-6">
        <Typography variant="h2">Color Palette</Typography>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Primary */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="bg-primary h-24 rounded-md"></div>
              <Typography variant="h6">Primary</Typography>
              <Typography variant="muted" className="text-xs">
                --primary
              </Typography>
              <div className="bg-primary rounded-md p-3">
                <Typography variant="small" className="text-primary-foreground">
                  Primary Foreground
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Secondary */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="bg-secondary h-24 rounded-md"></div>
              <Typography variant="h6">Secondary</Typography>
              <Typography variant="muted" className="text-xs">
                --secondary
              </Typography>
              <div className="bg-secondary rounded-md p-3">
                <Typography
                  variant="small"
                  className="text-secondary-foreground"
                >
                  Secondary Foreground
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Accent */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="bg-accent h-24 rounded-md"></div>
              <Typography variant="h6">Accent</Typography>
              <Typography variant="muted" className="text-xs">
                --accent
              </Typography>
              <div className="bg-accent rounded-md p-3">
                <Typography variant="small" className="text-accent-foreground">
                  Accent Foreground
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Muted */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="bg-muted h-24 rounded-md"></div>
              <Typography variant="h6">Muted</Typography>
              <Typography variant="muted" className="text-xs">
                --muted
              </Typography>
              <div className="bg-muted rounded-md p-3">
                <Typography variant="small" className="text-muted-foreground">
                  Muted Foreground
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Destructive */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="bg-destructive h-24 rounded-md"></div>
              <Typography variant="h6">Destructive</Typography>
              <Typography variant="muted" className="text-xs">
                --destructive
              </Typography>
              <div className="bg-destructive rounded-md p-3">
                <Typography
                  variant="small"
                  className="text-destructive-foreground"
                >
                  Destructive Foreground
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Background & Foreground */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="bg-background border-border h-24 rounded-md border"></div>
              <Typography variant="h6">Background</Typography>
              <Typography variant="muted" className="text-xs">
                --background
              </Typography>
              <div className="bg-background border-border rounded-md border p-3">
                <Typography variant="small" className="text-foreground">
                  Foreground Text
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* UI Components Preview */}
      <section className="space-y-6">
        <Typography variant="h2">UI Components Preview</Typography>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card */}
          <Card>
            <CardHeader>
              <CardTitle>Card Component</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="p">
                This is a card with card background and card-foreground text
                color.
              </Typography>
            </CardContent>
          </Card>

          {/* Popover */}
          <Card className="bg-popover text-popover-foreground">
            <CardHeader>
              <CardTitle>Popover Component</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="p">
                This is a popover with popover background and popover-foreground
                text color.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Border & Input Colors */}
      <section className="space-y-6">
        <Typography variant="h2">Borders & Inputs</Typography>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border-2">
            <CardContent className="space-y-2 p-4">
              <Typography variant="h6">Border Color</Typography>
              <Typography variant="muted" className="text-xs">
                --border
              </Typography>
            </CardContent>
          </Card>
          <Card className="border-input border-2">
            <CardContent className="space-y-2 p-4">
              <Typography variant="h6">Input Border</Typography>
              <Typography variant="muted" className="text-xs">
                --input
              </Typography>
              <input
                type="text"
                placeholder="Input example"
                className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chart Colors */}
      <section className="space-y-6">
        <Typography variant="h2">Chart Colors</Typography>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <Card key={num}>
              <CardContent className="space-y-2 p-4">
                <div
                  className="h-24 rounded-md"
                  style={{
                    backgroundColor: `var(--chart-${num})`,
                  }}
                ></div>
                <Typography variant="small" className="text-center">
                  Chart {num}
                </Typography>
                <Typography variant="muted" className="text-center text-xs">
                  --chart-{num}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive Buttons */}
      <section className="space-y-6">
        <Typography variant="h2">Interactive Elements</Typography>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>
    </div>
  );
}
