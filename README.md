# VisZom - Video Conferencing App

A modern video conferencing application built with Next.js, TypeScript, and real-time video streaming capabilities.

## 🚀 Features

- **🔐 Authentication**: Secure login with Clerk authentication
- **📹 Video Calls**: High-quality video conferencing with Stream
- **🎙️ Audio Controls**: Mute/unmute, volume controls
- **📺 Screen Sharing**: Share your screen during meetings
- **📝 Meeting Management**: Schedule, join, and manage meetings
- **🎥 Recording**: Record meetings for later review
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔗 Personal Room**: Permanent meeting room for quick access

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Video Streaming**: Stream.io
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account
- Stream.io account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd zoom-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   STREAM_SECRET_KEY=your_stream_secret_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
zoom-clone/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main app pages
│   └── meeting/           # Meeting room pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── providers/            # Context providers
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
