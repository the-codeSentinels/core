using System;
using System.Text;
using System.Timers;
using Vanara.PInvoke;      // Win32 structs / helpers

namespace OverlayScanner
{
    internal class Program
    {
        private static readonly System.Timers.Timer ScanTimer = new(1000);

        private static void Main()
        {
            if (OperatingSystem.IsWindows())
            {
                // All your Windows API calls here
                Console.WriteLine("Overlay-Scanner: watching every 1 s…");
                ScanTimer.Elapsed += (_, _) => ScanOnce();
                ScanTimer.Start();

                Console.WriteLine("Press [Enter] to exit");
                Console.ReadLine();
            }
            else
            {
                Console.WriteLine("This application only runs on Windows");
                return;
            }
        }

        private static void ScanOnce()
        {
            if (RecorderScanner.IsRecording())
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"[!] {DateTime.Now:T} Screen recorder detected");
                Console.ResetColor();
            }
            User32.EnumWindows((hWnd, _) =>
            {
                // Skip invisible / minimized windows
                if (!User32.IsWindowVisible(hWnd)) return true;

                // Get extended window-styles
                int exStyle = User32.GetWindowLong(hWnd, User32.WindowLongFlags.GWL_EXSTYLE);

                bool isLayered  = (exStyle & (int)User32.WindowStylesEx.WS_EX_LAYERED)   != 0;
                bool isTopMost  = (exStyle & (int)User32.WindowStylesEx.WS_EX_TOPMOST)   != 0;
                bool isToolWin  = (exStyle & (int)User32.WindowStylesEx.WS_EX_TOOLWINDOW)!= 0;

                if (isLayered && isTopMost && isToolWin)
                {
                    // Resolve window title (may be empty for true overlays)
                    var sb = new StringBuilder(256);
                    User32.GetWindowText(hWnd, sb, sb.Capacity);
                    string title = sb.ToString();
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"[!] {DateTime.Now:T} Transparent overlay detected  – HWND 0x{hWnd.DangerousGetHandle():X}  \"{title}\"");
                    Console.ResetColor();
                }

                return true; // continue enumeration
            }, IntPtr.Zero);
        }
    }
}
