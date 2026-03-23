import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { WatchPartyLobby } from "../components/watch-party/WatchPartyLobby";
import { WatchPartyRoom } from "../components/watch-party/WatchPartyRoom";
import { WatchPartyProvider, useWatchParty } from "../context/WatchPartyContext";

function WatchPartyExperience() {
  const { room, status } = useWatchParty();

  if (room && status === "joined") {
    return <WatchPartyRoom />;
  }

  return <WatchPartyLobby />;
}

export default function WatchPartyPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Helmet>
        <title>Afterglow | Watch Party</title>
        <meta
          name="description"
          content="Create or join a synchronized trailer watch party with live chat, host controls, room presence, and shared playback."
        />
      </Helmet>
      <WatchPartyProvider roomId={params.roomId} inviteToken={searchParams.get("invite") || ""}>
        <WatchPartyExperience />
      </WatchPartyProvider>
    </>
  );
}
