import LogSnag from "logsnag";
import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";

import { slackEmojiCodeMap } from "./emojiCodes";

import type { PublishOptions } from "logsnag";

interface Preferences {
  accessToken: string;
}

type Values = PublishOptions;

export default function Command() {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [error, setError] = useState<Error>();

  const preferences = getPreferenceValues<Preferences>();

  useEffect(() => {
    if (!preferences.accessToken)
      setError({
        name: "Invalid Access Token",
        message: "No or invalid LogSnag API access token found",
      });
  }, []);

  useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: error.name,
        message: error.message,
      });
    }
  }, [error]);

  async function handleSubmit({ channel, description, event, icon = "🔥", notify = true, project }: Values) {
    try {
      setIsLoading(true);

      await new LogSnag(preferences.accessToken).publish({
        channel,
        description,
        event,
        icon,
        notify,
        project,
      });

      showToast({
        style: Toast.Style.Success,
        title: "Published Event",
      });
    } catch (error) {
      console.error(error);
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to publish event",
        message: "Something went wrong publishing your event",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
      isLoading={isLoading}
    >
      <Form.TextField id="project" title="Project" info="Project name" placeholder="my-saas" />

      <Form.TextField id="channel" title="Channel" info="Channel name" placeholder="waitlist" />

      <Form.TextField id="event" title="Event" info="Event name example" placeholder="User Joined" />

      <Form.TextArea
        id="description"
        title="Description"
        info="Event description"
        placeholder="joe@example.com joined waitlist"
      />

      <Form.Checkbox id="notify" title="Notify" label="Send push notification" storeValue defaultValue={true} />

      <Form.Dropdown id="emoji" title="Emoji">
        {Object.entries(slackEmojiCodeMap).map(([key, value], i) => (
          <Form.Dropdown.Item key={i} value={value} title={key.replaceAll(":", "")} icon={value} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
