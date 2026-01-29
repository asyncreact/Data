
(async () => {
    try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
        
    await fetch('/ping', { 
        method: 'GET',
        signal: controller.signal 
    });
        
    clearTimeout(timeout);
    document.getElementById('TKpuZHGt').remove();
    } catch (e) {
    try {
        await fetch('/ping', { method: 'GET' });
        document.getElementById('TKpuZHGt').remove();
    } catch {
        setTimeout(() => {
          document.getElementById('TKpuZHGt').remove();
        }, 30000);
       }
      }
})();