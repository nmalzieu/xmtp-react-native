import React from 'react';
import {useEffect, useState} from 'react';
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {ethers, Signer} from 'ethers';
import {Client} from '@xmtp/xmtp-js';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import WalletConnectProvider from '@walletconnect/web3-provider';

export const INFURA_API_KEY = '2bf116f1cc724c5ab9eec605ca8440e1';

const Home = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [address, setAddress] = useState<string>('');
  const [signer, setSigner] = useState<Signer | undefined>(undefined);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const connector = useWalletConnect();

  const connectWallet = React.useCallback(async () => {
    const provider = new WalletConnectProvider({
      infuraId: INFURA_API_KEY,
      connector: connector,
      qrcode: false,
    });
    await connector.connect();
    // await provider.enable();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const newSigner = ethersProvider.getSigner() as Signer;
    const newAddress = await newSigner.getAddress();
    console.log('SUCCESS! authenticated: ' + newAddress);
    setAddress(newAddress);
    setSigner(newSigner);
  }, [connector]);

  // const disconnectWallet = React.useCallback(async () => {
  //   await connector.killSession();
  // }, [connector]);

  const sendGm = React.useCallback(async () => {
    if (!client) {
      return;
    }
    const conversation = await client.conversations.newConversation(
      '0x08c0A8f0e49aa245b81b9Fde0be0cD222766DECA',
    );
    const message = await conversation.send(
      `gm! ${Platform.OS === 'ios' ? 'from iOS' : 'from Android'}`,
    );
    console.log('sent message: ' + message.content);
  }, [client]);

  // Initialize XMTP client
  useEffect(() => {
    const initXmtpClient = async () => {
      if (!signer) {
        return;
      }

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

  // TODO(elise): Add back loading state when waiting for signature.
  // if (isLoading) {
  //   return <Authenticating />;
  // }

  // if (error) {
  //   return <Error message={error.message} />;
  // }

  // if (!signer) {
  //   return <Error message="Invalid signer" />;
  // }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text style={styles.sectionTitle}>Example Chat App</Text>
          <Text>{signer ? address : 'Sign in with XMTP'}</Text>
          {signer ? (
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
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default Home;
