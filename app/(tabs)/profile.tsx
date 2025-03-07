import {
	View,
	Text,
	SafeAreaView,
	FlatList,
	Pressable,
	ActivityIndicator,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import { useAuth } from "../../lib/AuthProvider";
import { getUserAttempts, returnFirstSixWords } from "../../lib/util";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import Attempts from "../../components/Attempts";

type Attempt = {
	score: number;
	date: string;
};

export default function ProfileScreen() {
	const [loading, setLoading] = useState<boolean>(false);
	const [dataLoading, setDataLoading] = useState<boolean>(true);
	const [total_score, setTotalScore] = useState<number>(0);
	const [attempts, setAttempts] = useState<Attempt[]>([]);
	const { session } = useAuth();
	const router = useRouter();

	const handleSignOut = async () => {
		setLoading(true);
		try {
			const { error } = await supabase.auth.signOut();
			setLoading(false);
			if (error) throw error;
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (!session) {
			router.replace('/');
		}
	}, [session]);

	useEffect(() => {
		if (!session?.user?.id) return;
		async function getAttempts() {
			const result = await getUserAttempts(session?.user.id);
			setAttempts(JSON.parse(result?.attempts || '[]'));
			setTotalScore(result?.total_score || 0);
			setDataLoading(false);
		}
		getAttempts();
	}, [session]);

	return (
		<SafeAreaView className='flex-1 bg-orange-100 p-4'>
			<View className='flex items-center justify-center mb-6'>
				<View className='rounded-full w-[120px] h-[120px] flex items-center justify-center bg-[#fdba74] my-4'>
					<SvgUri
						width='80'
						height='80'
						uri={`https://api.dicebear.com/7.x/notionists/svg?backgroundColor=fdba74&seed=${session?.user.email || "user"
							}`}
					/>
				</View>
				<Text className='text-gray-600 mb-[1px]'>
					<FontAwesome name='star' size={20} color='red' />
					<Text>{total_score}</Text>
				</Text>
				<Text className='text-gray-600 mb-2'>
					@{returnFirstSixWords(session?.user.email) || "user"}
				</Text>
				<Pressable onPress={() => handleSignOut()} disabled={loading}>
					<Text className='text-red-500'>
						{loading ? "Logging out..." : "Log out"}
					</Text>
				</Pressable>
			</View>

			<Text className='font-bold text-xl text-gray-700 mb-3 px-4'>
				Recent Attempts
			</Text>
			{dataLoading ? (
				<ActivityIndicator size='large' color='#ea580c' />
			) : (
				<FlatList
					data={attempts}
					contentContainerStyle={{ padding: 15 }}
					renderItem={({ item }) => <Attempts item={item} />}
					keyExtractor={(item, index) => index.toString()}
				/>

			)}
		</SafeAreaView>
	);
}