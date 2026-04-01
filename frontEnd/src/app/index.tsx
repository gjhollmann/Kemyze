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

        <View style = {styles.backgroundGradient}>
        <Text style = {styles.text}>
            Edit src/app/index.tsx to edit this screen.
          </Text>
        <Text style = {styles.text}>
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
    text:{
        color:'white',
    },
    backgroundGradient: {
      width: '100%',
      height: '100%',
      experimental_backgroundImage: 'linear-gradient(to left, #09091C 0%, #131338 33%, #131338 66%, #09091C 100%)',
    },
});
