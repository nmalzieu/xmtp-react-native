import React, {useCallback} from 'react';
import {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {ethers, Signer} from 'ethers';
import {Client} from '@xmtp/xmtp-js';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import WalletConnectProvider from '@walletconnect/web3-provider';

export const INFURA_API_KEY = '2bf116f1cc724c5ab9eec605ca8440e1';

export const RECIPIENT_ADDRESS = 'REPLACE_WITH_ETH_ADDRESS';

const Home = () => {
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [signer, setSigner] = useState<Signer | undefined>(undefined);
  const [address, setAddress] = useState<string>('');

  const connector = useWalletConnect();

  const provider = new WalletConnectProvider({
    infuraId: INFURA_API_KEY,
    connector: connector,
  });

  useEffect(() => {
    if (connector?.connected && !signer) {
      const requestSignatures = async () => {
        await provider.enable();
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const newSigner = ethersProvider.getSigner();
        const newAddress = await newSigner.getAddress();
        setAddress(newAddress);
        setSigner(newSigner);
      };
      requestSignatures();
    } else {
      if (!connector?.connected) {
        return;
      }
      const disconnect = async () => {
        await connector?.killSession();
      };
      disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector]);

  const connectWallet = useCallback(async () => {
    await connector?.connect();
  }, [connector]);

  const sendGm = React.useCallback(async () => {
    if (!client) {
      return;
    }
    const conversation = await client.conversations.newConversation(
      RECIPIENT_ADDRESS,
    );
    const message = await conversation.send(
      `gm! ${Platform.OS === 'ios' ? 'from iOS' : 'from Android'}`,
    );
    Alert.alert('Message sent', message.content);
  }, [client]);

  useEffect(() => {
    const initXmtpClient = async () => {
      if (!signer) {
        return;
      }

      const newAddress = await signer.getAddress();
      setAddress(newAddress);

      if (!client) {
        /**
         * Tip: Ethers' random wallet generation is slow in Hermes https://github.com/facebook/hermes/issues/626.
         * If you would like to quickly create a random Wallet for testing, use:
         * import {utils} from @noble/secp256k1;
         * import {Wallet} from ethers;
         * await Client.create(new Wallet(utils.randomPrivateKey()));
         */
        const xmtp = await Client.create(signer);
        setClient(xmtp);
      }
    };
    initXmtpClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Example Chat App</Text>
          <Text style={styles.sectionDescription}>
            {client ? address : 'Sign in with XMTP'}
          </Text>
          {client ? (
            <Button title="Send a gm" onPress={sendGm} />
          ) : (
            <Button title="Sign in" onPress={connectWallet} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '400',
  },
});

export default Home;
