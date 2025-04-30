using System;
using SharpDX.DXGI;

// Very lightweight “is anything duplicating the desktop?”
internal static class RecorderScanner
{
    public static bool IsRecording()
    {
        try
        {
            using var factory = new Factory1();
            foreach (var adapter in factory.Adapters1)
            {
                foreach (var output in adapter.Outputs)
                {
                    using var dup = output.QueryInterface<Output1>()
                                          .DuplicateOutput(adapter);
                    dup.Dispose();   // no-one else is grabbing it
                }
            }
            return false;
        }
        catch (SharpDX.SharpDXException ex) when
              (ex.ResultCode.Code == SharpDX.DXGI.ResultCode.AccessDenied.Result.Code)
        {
            return true;    // AccessDenied => someone already owns duplication API
        }
    }
}
