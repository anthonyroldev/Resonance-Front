import { AppShell } from "@/components/AppShell";
import { ScrollContainer } from "@/components/feed/ScrollContainer";

export default function HomeLayout() {
  return (
    <AppShell>
      <ScrollContainer />
    </AppShell>
  );
}