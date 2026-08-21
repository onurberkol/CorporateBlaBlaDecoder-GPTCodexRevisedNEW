import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { captureError } from '@/lib/crash';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Catches render-time crashes so a single bad screen doesn't white-screen the
 * whole app, and forwards the error to the crash handler.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    captureError(error, { info });
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#1A1714', textAlign: 'center' }}>
          Bir şeyler ters gitti
        </Text>
        <Text style={{ color: '#6B6358', textAlign: 'center', marginTop: 8, fontSize: 14 }}>
          Sorun bizde, sende değil. Tekrar dene.
        </Text>
        <Pressable
          onPress={this.reset}
          style={{ marginTop: 20, backgroundColor: '#1A1714', borderRadius: 8, paddingHorizontal: 22, paddingVertical: 12 }}
        >
          <Text style={{ color: '#F4F1EA', fontWeight: '500' }}>Yeniden dene</Text>
        </Pressable>
      </View>
    );
  }
}
