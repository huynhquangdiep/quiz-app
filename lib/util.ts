import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export interface Category {
	id: string;
	topic: string;
	url: string;
	icon: string;
}

export interface Question {
	id: number;
	category: string;
	question: string;
	answer: string;
	options: string[];
}

export const categories: Category[] = [
	{
		id: "dia-ly",
		topic: "Địa Lý",
		url: "https://raw.githubusercontent.com/huynhquangdiep/quiz-app/main/questions/dialy.json",
		icon: "html5",
	},
	{
		id: "hoa-hoc",
		topic: "Hóa Học",
		url: "https://raw.githubusercontent.com/huynhquangdiep/quiz-app/main/questions/hoahoc.json",
		icon: "css3-alt",
	},
	{
		id: "sinh-hoc",
		topic: "Sinh Học",
		url: "https://raw.githubusercontent.com/huynhquangdiep/quiz-app/main/questions/sinhhoc.json",
		icon: "database",
	},
	{
		id: "tieng-anh",
		topic: "Tiếng Anh",
		url: "https://raw.githubusercontent.com/huynhquangdiep/quiz-app/main/questions/tienganh.json",
		icon: "js",
	},
	{
		id: "toan",
		topic: "Toán",
		url: "https://raw.githubusercontent.com/huynhquangdiep/quiz-app/main/questions/toan.json",
		icon: "code",
	},
	{
		id: "vat-ly",
		topic: "Vật Lý",
		url: "https://raw.githubusercontent.com/huynhquangdiep/quiz-app/main/questions/vatly.json",
		icon: "paint-brush",
	},
];

export const returnFirstSixWords = (str: string | undefined): string => {
	if (!str) return "User";
	return str.slice(0, 6);
};

const getCurrentDate = (): string => {
	const currentDate = new Date();
	const day = currentDate.getDate().toString().padStart(2, "0");
	const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
	const year = currentDate.getFullYear();

	return `${day}-${month}-${year}`;
};

export const getGreeting = (): { greeting: string; day: boolean } => {
	const currentDate = new Date();
	const currentHour = currentDate.getHours();

	if (currentHour >= 5 && currentHour < 12) {
		return { greeting: "Chào buổi sáng", day: true };
	} else if (currentHour >= 12 && currentHour < 17) {
		return { greeting: "Chào buổi chiều", day: true };
	} else if (currentHour >= 17 && currentHour < 21) {
		return { greeting: "Chào buổi tối", day: true };
	} else {
		return { greeting: "Chúc ngủ ngon", day: false };
	}
};

export const getQuestions = async (endpoints: string[]) => {
	try {
		const responses = await Promise.all(endpoints.map((url) => fetch(url)));

		const data = await Promise.all(
			responses.map(async (response) => {
				const jsonResponse = await response.json();
				const shuffledData = jsonResponse
					.sort(() => Math.random() - 0.5)
					.slice(0, 10);
				return shuffledData;
			})
		);
		const questions = [].concat(...data);
		const response = storeData(questions);
		return response;
	} catch (error) {
		console.error("Lỗi:", error);
	}
};

const storeData = async (questions: Question[]) => {
	try {
		const jsonQuestions = JSON.stringify(questions);
		await AsyncStorage.setItem("questions", jsonQuestions);
		return true;
	} catch (e) {
		return false;
	}
};

export const getAllQuestionsFromStorage = async () => {
	try {
		const value = await AsyncStorage.getItem("questions");
		if (value !== null) {
			return JSON.parse(value);
		}
	} catch (e) {
		return [];
	}
};

export const saveScore = async ({
	userScore,
	userID,
	userEmail,
}: {
	userScore: number;
	userID: string | undefined;
	userEmail: string | undefined;
}) => {
	if (!userID) return;
	try {
		const { data, error } = await supabase
			.from("scores")
			.insert({
				attempts: [{ score: userScore, date: getCurrentDate() }],
				total_score: userScore,
				user_id: userID,
				email: userEmail,
			})
			.single();
		if (error) throw error;
	} catch (err) {
		console.log(err);
	}
};

export const getUserAttempts = async (userID: string | undefined) => {
	if (!userID) return;
	try {
		const { data, error } = await supabase
			.from("scores")
			.select("attempts, total_score")
			.eq("user_id", userID);
		if (error) throw error;
		return { attempts: data[0].attempts, total_score: data[0].total_score };
	} catch (err) {
		return { attempts: "", total_score: 0 };
	}
};

export const getLeaderBoard = async () => {
	try {
		const { data, error } = await supabase
			.from("scores")
			.select("total_score, user_id, email")
			.order("total_score", { ascending: false })
			.limit(10);
		if (error) throw error;
		return data;
	} catch (err) {
		return null;
	}
};