// src/App.tsx
export const appTsx = `import { Container, Heading, Text, Button, Stack, Code } from '@vira-ui/ui';
import { useViraState } from '@vira-ui/react';
import './index.css';

interface DemoState {
  counter: number;
  patched?: boolean;
  ts?: number;
  message?: string;
  at?: number;
}

export function App() {
  const { data, sendEvent, sendUpdate, sendDiff } = useViraState<DemoState>('demo', {
    enableMsgId: true,
  });

  // Use server state instead of local counter
  const currentCounter = data?.counter ?? 0;

  const bump = () => {
    // Send diff with increment - server will handle versioning
    sendDiff({ counter: currentCounter + 1 });
  };

  const echo = () => {
    sendEvent('demo.echo', {
      message: 'hello from client',
      at: Date.now(),
      counter: currentCounter,
    });
  };

  const patch = () => {
    sendDiff({ patched: true, ts: Date.now() });
  };

  return (
    <Container design={{ padding: 8, maxWidth: '900px', margin: '0 auto' }}>
      <Stack space={3}>
        <Heading design={{ fontSize: '2rem', fontWeight: 'bold' }}>Vira Engine demo</Heading>
        <Text color="#555">
          WebSocket demo channel <Code>demo</Code>. Uses handshake/session, versioned updates/diffs.
        </Text>
        <Stack direction="row" space={2}>
          <Button preset="primary" onClick={bump}>
            sendDiff (counter + 1)
          </Button>
          <Button preset="secondary" onClick={patch}>
            sendDiff (patch)
          </Button>
          <Button preset="ghost" onClick={echo}>
            sendEvent (demo.echo)
          </Button>
        </Stack>
        <Heading design={{ fontSize: '1.1rem' }}>State:</Heading>
        <Code block>{JSON.stringify(data ?? {}, null, 2)}</Code>
      </Stack>
    </Container>
  );
}
`;