import {
	Text,
	View,
	TextInput,
	ImageBackground,
	Pressable,
	Alert
} from "react-native";
import { useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link, useRouter} from "expo-router";
import { supabase } from "../lib/supabase";

export default function RegisterScreen() {
	const router = useRouter();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	
	const handleRegister = async() => {
		if (!email.trim() || !password.trim()) return Alert.alert("Error", "Please fill in all fields");
		setLoading(true);
		const { error } = await supabase.auth.signUp({ email, password });
		setLoading(false);
		if (error) return Alert.alert("Error", error.message);
		router.replace("/");
	};

	return (
		<View className=' flex-1'>
			<ImageBackground
				className='flex-1 flex items-center justify-center'
				source={{ uri: "https://images.unsplash.com/photo-1497704628914-8772bb97f450?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
			>
				<View className='w-full px-4'>
					<View className='w-full flex items-center justify-center'>
						<FontAwesome5
							name='phoenix-framework'
							size={70}
							color='white'
							className='mb-4'
						/>
						<Text className='text-3xl mb-4 font-bold text-white text-center'>
							Đăng ký
						</Text>
					</View>

					<Text className='text-lg text-gray-200'>Email</Text>
					<TextInput
						className='w-full border-b-[1px] py-4 rounded-md mb-3 text-white font-bold'
						onChangeText={setEmail}
						value={email}
					/>
					<Text className='text-lg text-gray-200'>Mật khẩu</Text>
					<TextInput
						className='w-full border-b-[1px] py-4 rounded-md mb-3 text-white font-bold'
						secureTextEntry
						value={password}
						onChangeText={setPassword}
					/>
					<Pressable
						className={`w-full ${loading ? "bg-orange-200": "bg-orange-600"} rounded-xl p-4 border-[1px] border-orange-200`}
						disabled={loading}
						onPress={() => handleRegister()}
					>
						<Text className="text-white text-center font-bold text-xl">
							{loading ? "Registering..." : "Sign up"}
						</Text>
					</Pressable>
					<Text className='text-center mt-2 text-orange-200'>
						Bạn đã có tài khoản?{" "}
						<Link href='/'>
							<Text className='text-white'>Đăng Nhập</Text>
						</Link>
					</Text>
				</View>
			</ImageBackground>
		</View>
	);
}