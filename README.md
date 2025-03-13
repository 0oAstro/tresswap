# Hairify - Transform Your Look! ✨

A magical AI-powered hair transformation app built with Next.js, Tailwind CSS, Shadcn UI, and Supabase.

![Hairify](https://example.com/hairify-preview.jpg)

## ✨ Features

- 🎭 **Celebrity Hair Transformations**: Try on popular celebrity hairstyles with one click
- 📸 **Multiple Upload Options**: Upload photos, take selfies, or choose from your gallery
- 🔮 **Live Preview Animation**: See your new hairstyle floating over your head before applying
- 🎲 **Surprise Me Button**: Get a random celebrity hairstyle for fun transformations
- 📊 **Trending Hairstyles**: Discover popular styles with beautiful charts and analytics
- 🌟 **AI-Powered Descriptions**: Get poetic descriptions of your transformation using Google's Gemini AI
- 💾 **Save & Share**: Store your transformations and share them on social media

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- Google AI (Gemini) API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/hairify.git
   cd hairify
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:

   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase and Google AI credentials

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_gemini_api_key
   ```

4. Run the Supabase SQL setup script found in `src/lib/supabase.ts` to set up the necessary tables and security rules.

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💅 Technologies Used

- **Frontend**: Next.js 15+, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Shadcn UI
- **Animations**: Framer Motion
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **File Uploads**: React Dropzone
- **Form Management**: React Hook Form, Zod
- **AI Text Generation**: Google Generative AI (Gemini)
- **Charts**: Recharts
- **Sliders**: Swiper

## 📱 Features Roadmap

- [ ] Mobile app with React Native
- [ ] More celebrity hairstyles
- [ ] AI-generated custom hairstyles
- [ ] Video transformations
- [ ] Social sharing and community features
- [ ] Premium subscription features

## 🔒 Privacy & Security

- All user data is stored securely in Supabase
- Row-level security ensures users can only access their own data
- Photos are processed securely and not shared with third parties

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Supabase](https://supabase.io/)
- AI features powered by [Google Gemini](https://ai.google.dev/)
