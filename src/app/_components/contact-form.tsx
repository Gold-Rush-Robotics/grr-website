"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function ContactForm() {
  return (
    <Card className="bg-card/50 h-full">
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Your Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
              />
              <FieldDescription>
                Enter an email address that we can contact you back at.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <FieldDescription>Enter your message here.</FieldDescription>
              <Textarea
                id="message"
                placeholder="Enter your message here."
                rows={8}
              />
            </Field>
            <Button
              type="submit"
              onClick={() =>
                toast.info(
                  "This functionality is coming soon! For now, please contact us directly at goldrushrobotics@charlotte.edu",
                )
              }
            >
              Send <Send />
            </Button>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  );
}
