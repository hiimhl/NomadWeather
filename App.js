import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";

// 기기의 화면 사이즈
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const API_KEY = "66ad1d25eaddc52e77ec8c40664a9670";

  // Location
  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    //위치 사용을 거절했다면 false로 설정
    if (!granted) setOk(false);

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );

    setCity(location[0].city);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();

    setDays(
      // 3시간 단위로 날씨 정보가 있는 api이기 때문에 09시의 데이터만 저장.
      json.list.filter((weather) => {
        if (weather.dt_txt.includes("09:00:00")) return weather;
      })
    );
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator="false"
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              style={styles.loading}
              color="black"
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <Text style={styles.temp}>
                {parseFloat(day.main.temp).toFixed(1)}
              </Text>

              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
              <Text style={styles.date}>{day.dt_txt.slice(5, 10)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "mediumpurple",
  },
  city: {
    flex: 1.1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 45,
    fontWeight: "500",
    color: "white",
  },
  weather: {
    // flex: 3,
  },
  loading: {
    marginTop: 10,
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "left",
    marginLeft: 20,
  },
  temp: {
    color: "white",
    fontSize: 85,
    fontWeight: "500",
  },
  description: {
    color: "white",
    marginTop: -10,
    fontSize: 35,
    fontWeight: "500",
  },
  tinyText: {
    color: "white",
    fontSize: 20,
  },
  date: {
    color: "white",
    fontSize: 18,
  },
});
