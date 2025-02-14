const { GoogleGenerativeAI } = require("@google/generative-ai");
const { config } = require("dotenv");

export class aiServices {
    private GEMINI_API_KEY: string;
    private genAI: typeof GoogleGenerativeAI;
    private model: any;

    // Constructor to initialize the class with the API key and setup model
    constructor() {
        config();
        const apiKey: string | undefined = process.env.GEMINI_API_KEY;
        // if (!apiKey) {
        //     throw new Error("GEMINI_API_KEY is not defined in the environment variables");
        // }
        this.GEMINI_API_KEY = "AIzaSyCTpKvVKeEwUy_ozRYSwe_6r6eMITNY_7Q";
        this.genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    // Method to ask AI a question and get a response
    async askAI(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();  // Adjust this based on your actual response structure
        } catch (error) {
            console.error("Error generating content from AI:", error);
            throw new Error("Failed to get AI response");
        }
    }
}
