import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const heartImg = require("../../assets/images/heart.png");
const pilotSnoopyImg = require("../../assets/images/pilotSnoopy.png");
const sleepSnoopyImg = require("../../assets/images/sleepSnoopy.png");
const angrySnoopyImg = require("../../assets/images/angrySnoopy.png");
const loveSnoopyImg = require("../../assets/images/loveSnoopy.png");

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const HEART_COUNT = 18;
const HEART_SIZES = [36, 44, 52, 60, 68];

// ─── Heart particle (uses heart.png) ────────────────────────────
function FloatingHeart({
  index,
  onPopped,
}: {
  index: number;
  onPopped: () => void;
}) {
  const size = HEART_SIZES[index % HEART_SIZES.length];
  const startX = Math.random() * (SCREEN_W - size);
  const startY = SCREEN_H + 40 + Math.random() * 120;

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const delay = index * 120;
    const riseDistance = -(SCREEN_H * 0.45 + Math.random() * SCREEN_H * 0.3);
    const drift = (Math.random() - 0.5) * 120;
    const riseDuration = 1600 + Math.random() * 600;

    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 6, stiffness: 120 })
    );
    rotation.value = withDelay(
      delay,
      withTiming((Math.random() - 0.5) * 30, { duration: riseDuration })
    );
    translateY.value = withDelay(
      delay,
      withTiming(riseDistance, {
        duration: riseDuration,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(
      delay,
      withTiming(drift, { duration: riseDuration })
    );

    const popStart = delay + riseDuration;
    scale.value = withDelay(
      popStart,
      withSequence(
        withTiming(1.5, { duration: 120 }),
        withTiming(0, { duration: 100 })
      )
    );
    opacity.value = withDelay(
      popStart + 180,
      withTiming(0, { duration: 60 })
    );

    const totalDuration = popStart + 180 + 60;
    const timer = setTimeout(onPopped, totalDuration);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { position: "absolute", left: startX, top: startY, width: size, height: size },
        animStyle,
      ]}
    >
      <Image source={heartImg} style={{ width: size, height: size }} resizeMode="contain" />
    </Animated.View>
  );
}

// ─── Pilot Snoopy flying across the top ─────────────────────────
function FlyingSnoopy() {
  const translateX = useSharedValue(-180);

  useEffect(() => {
    translateX.value = withDelay(
      400,
      withTiming(SCREEN_W + 180, {
        duration: 3500,
        easing: Easing.inOut(Easing.quad),
      })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.flyingSnoopy, animStyle]}>
      <Image source={pilotSnoopyImg} style={styles.pilotImg} resizeMode="contain" />
    </Animated.View>
  );
}

// ─── No button with Snoopy reactions ────────────────────────────
function NoButton({
  onPress,
  onHoverIn,
  onHoverOut,
}: {
  onPress: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
}) {
  const offsetX = useSharedValue(0);

  const handlePress = () => {
    offsetX.value = withTiming(-SCREEN_W, {
      duration: 600,
      easing: Easing.in(Easing.quad),
    });
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
        style={styles.noButton}
      >
        <Text style={styles.buttonText}>No</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ────────────────────────────────────────────────
export default function Index() {
  const [phase, setPhase] = useState<"hearts" | "question" | "love">("hearts");
  const [snoopyAngry, setSnoopyAngry] = useState(false);
  const poppedCount = useRef(0);

  const handlePopped = () => {
    poppedCount.current += 1;
    if (poppedCount.current >= HEART_COUNT) {
      setPhase("question");
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Hearts intro + flying Snoopy ── */}
      {phase === "hearts" && (
        <View style={StyleSheet.absoluteFill}>
          {Array.from({ length: HEART_COUNT }).map((_, i) => (
            <FloatingHeart key={i} index={i} onPopped={handlePopped} />
          ))}
          <FlyingSnoopy />
        </View>
      )}

      {/* ── Valentine question ── */}
      {phase === "question" && (
        <Animated.View
          entering={FadeIn.duration(800)}
          style={styles.center}
        >
          <Text style={styles.questionText}>Will you be my valentine?</Text>

          <View style={styles.options}>
            <Pressable
              onPress={() => setPhase("love")}
              style={styles.yesButton}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </Pressable>

            <NoButton
              onPress={() => setSnoopyAngry(true)}
              onHoverIn={() => setSnoopyAngry(true)}
              onHoverOut={() => setSnoopyAngry(false)}
            />
          </View>

          {/* Sleepy / Angry Snoopy under buttons */}
          <Image
            source={snoopyAngry ? angrySnoopyImg : sleepSnoopyImg}
            style={snoopyAngry ? styles.angrySnoopyImg : styles.sleepSnoopyImg}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      {/* ── I Love You ── */}
      {phase === "love" && (
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.center}
        >
          <Image
            source={loveSnoopyImg}
            style={styles.loveSnoopyImg}
            resizeMode="contain"
          />
          <Text style={styles.loveText}>I Love You!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f5",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  questionText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#d63384",
    marginBottom: 32,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  options: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  yesButton: {
    backgroundColor: "#ff1493",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  noButton: {
    backgroundColor: "#ff69b4",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  flyingSnoopy: {
    position: "absolute",
    top: 60,
  },
  pilotImg: {
    width: 140,
    height: 110,
  },
  sleepSnoopyImg: {
    width: 180,
    height: 70,
    marginTop: 40,
  },
  angrySnoopyImg: {
    width: 120,
    height: 150,
    marginTop: 24,
  },
  loveSnoopyImg: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  loveText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#d63384",
  },
});
