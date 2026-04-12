import { env } from "@/env";

/**
 * Discord Components v2 message flag
 */
const IS_COMPONENTS_V2 = 1 << 15; // 32768

/**
 * Component types
 */
const ComponentType = {
  ACTION_ROW: 1,
  BUTTON: 2,
  STRING_SELECT: 3,
  TEXT_INPUT: 4,
  USER_SELECT: 5,
  ROLE_SELECT: 6,
  MENTIONABLE_SELECT: 7,
  CHANNEL_SELECT: 8,
  SECTION: 9,
  TEXT_DISPLAY: 10,
  THUMBNAIL: 11,
  MEDIA_GALLERY: 12,
  FILE: 13,
  SEPARATOR: 14,
  CONTAINER: 17,
  LABEL: 18,
  FILE_UPLOAD: 19,
} as const;

/**
 * Text Display component
 */
type TextDisplayComponent = {
  type: typeof ComponentType.TEXT_DISPLAY;
  id?: number;
  content: string;
};

/**
 * Container component
 */
type ContainerComponent = {
  type: typeof ComponentType.CONTAINER;
  id?: number;
  components: TopLevelComponent[];
  accent_color?: number;
  spoiler?: boolean;
};

/**
 * Section component
 */
type SectionComponent = {
  type: typeof ComponentType.SECTION;
  id?: number;
  components: TextDisplayComponent[];
  accessory?: {
    type: typeof ComponentType.BUTTON | typeof ComponentType.THUMBNAIL;
    [key: string]: unknown;
  };
};

/**
 * Separator component
 */
type SeparatorComponent = {
  type: typeof ComponentType.SEPARATOR;
  id?: number;
  divider?: boolean;
  spacing?: 1 | 2;
};

/**
 * Top-level components that can be used in messages
 */
type TopLevelComponent =
  | ContainerComponent
  | SectionComponent
  | TextDisplayComponent
  | SeparatorComponent;

/**
 * Discord webhook payload with Components v2
 */
type DiscordWebhookPayload = {
  flags?: number;
  username?: string;
  components: TopLevelComponent[];
};

/**
 * Result of sending a Discord webhook
 */
type DiscordWebhookResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Sends a message to Discord via webhook using Components v2 with proper error handling and validation.
 *
 * @param payload The Discord webhook payload with Components v2.
 * @param payload.flags Optional bitwise flags to apply to the message.
 * @param payload.username Optional override for the webhook username.
 * @param payload.components Top-level Components v2 payload to render in the message.
 * @param timeout Request timeout in milliseconds (default: 5000).
 * @returns A result object indicating whether the request succeeded or failed, with an error message on failure.
 */
export async function sendDiscordWebhook(
  payload: DiscordWebhookPayload,
  timeout = 5000,
): Promise<DiscordWebhookResult> {
  if (!env.DISCORD_WEBHOOK_URL) {
    return { success: false, error: "Discord webhook URL not configured" };
  }

  // Ensure Components v2 flag is set
  const payloadWithFlag = {
    ...payload,
    flags: IS_COMPONENTS_V2,
  };

  const webhookUrl = new URL(env.DISCORD_WEBHOOK_URL);
  if (!webhookUrl.searchParams.has("with_components")) {
    webhookUrl.searchParams.set("with_components", "true");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(webhookUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadWithFlag),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: `Discord webhook returned ${response.status}: ${errorText}`,
      };
    }

    // Discord returns 204 No Content on success, but some webhooks might return 200
    if (response.status === 204 || response.status === 200) {
      return { success: true };
    }

    return {
      success: false,
      error: `Unexpected response status: ${response.status}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { success: false, error: "Request timeout" };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Creates a Text Display component.
 *
 * @param content Markdown or plain-text content to display in the component body.
 * @returns A Components v2 `TEXT_DISPLAY` component.
 */
export function createTextDisplay(content: string): TextDisplayComponent {
  return {
    type: ComponentType.TEXT_DISPLAY,
    content,
  };
}

/**
 * Creates a Container component with optional accent color.
 *
 * @param components Ordered list of top-level components to include inside the container.
 * @param accentColor Optional decimal RGB color used as the container accent (Discord integer color format).
 * @returns A Components v2 `CONTAINER` component wrapping the provided children.
 */
export function createContainer(
  components: TopLevelComponent[],
  accentColor?: number,
): ContainerComponent {
  return {
    type: ComponentType.CONTAINER,
    components,
    ...(accentColor !== undefined && { accent_color: accentColor }),
  };
}

/**
 * Creates a Section component with text and an optional accessory.
 *
 * @param textComponents One to three `TextDisplayComponent` items that make up the main section content.
 * @param accessory Optional accessory definition such as a button or thumbnail.
 * @returns A Components v2 `SECTION` component.
 * @throws If the number of `textComponents` is not between 1 and 3 (inclusive).
 */
export function createSection(
  textComponents: TextDisplayComponent[],
  accessory?: SectionComponent["accessory"],
): SectionComponent {
  if (textComponents.length < 1 || textComponents.length > 3) {
    throw new Error("Section must have 1-3 Text Display components");
  }
  return {
    type: ComponentType.SECTION,
    components: textComponents,
    ...(accessory && { accessory }),
  };
}

/**
 * Creates a Separator component.
 *
 * @param divider Whether the separator should render a visual divider line (default: `true`).
 * @param spacing Vertical spacing size around the separator (1 or 2; default: `1`).
 * @returns A Components v2 `SEPARATOR` component.
 */
export function createSeparator(
  divider = true,
  spacing: 1 | 2 = 1,
): SeparatorComponent {
  return {
    type: ComponentType.SEPARATOR,
    divider,
    spacing,
  };
}

/**
 * Helper function to create a contact form notification using Components v2.
 *
 * @param title Title to display at the top of the message (rendered as a level-2 heading).
 * @param fields Array of field objects used to build a compact header-style summary.
 * @param fields[].name Display label for the field (e.g. `"Name"`, `"Email"`).
 * @param fields[].value Raw value submitted for the field.
 * @param message Full body message or description submitted through the contact form.
 * @param accentColor Optional container accent color in Discord integer color format.
 * @returns A `DiscordWebhookPayload` suitable for sending with `sendDiscordWebhook`.
 */
export function createContactFormMessage(
  title: string,
  fields: Array<{ name: string; value: string }>,
  message: string,
  accentColor?: number,
): DiscordWebhookPayload {
  const titleDisplay = createTextDisplay(`## ${title}`);

  // Field summary
  const fieldDisplays: TopLevelComponent[] = fields.map((field) => {
    let fieldText: string;
    if (field.name.toLowerCase() === "email") {
      const mailtoLink = `[${field.value}](mailto:${field.value})`;
      fieldText = `**${field.name}:** ${mailtoLink}`;
    } else {
      fieldText = `**${field.name}:** ${field.value}`;
    }
    return createTextDisplay(fieldText);
  });

  const messageDisplay = createTextDisplay(message);

  const components: TopLevelComponent[] = [
    titleDisplay,
    ...fieldDisplays,
    createSeparator(true, 2),
    messageDisplay,
  ];
  const container = createContainer(components, accentColor);

  return {
    components: [container],
  };
}
