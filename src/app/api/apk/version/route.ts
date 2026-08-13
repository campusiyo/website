import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    versionName: "1.1.0",
    versionCode: 2,
    downloadUrl: "https://campusiyo.in/Campusiyo.apk",
    releaseNotes: "• Google Sign-In fixes and WebView compatibility\n• Improved mobile navigation drawer\n• Automatic version detection and seamless APK update support",
    minimumVersionCode: 1,
  });
}
