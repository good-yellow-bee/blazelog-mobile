import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: NetInfoStateType;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    connectionType: NetInfoStateType.unknown,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isOnline: state.isConnected ?? false,
        connectionType: state.type,
      });
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      setStatus({
        isOnline: state.isConnected ?? false,
        connectionType: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
};
