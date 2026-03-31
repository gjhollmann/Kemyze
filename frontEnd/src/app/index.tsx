import { Text, View, StyleSheet } from "react-native";
import { useState } from 'react';


export default function Index() {
    const [data, setData] = useState('if you see this, the fetch failed');
    const getDBTest = async () => {
      try {
        const response = await fetch(
          'https://kemyze.vercel.app/dbtest',
        );
          console.log(response);
        const text = (await response.text());
        setData(text)
      } catch (error) {
        console.error(error);
      }
    };
    
getDBTest();
    
return (
    <View style={styles.container}>
          <Text>
            Edit src/app/index.tsx to edit this screen.
          </Text>
        <Text>
        {data}
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
