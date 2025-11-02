export const useSidebar = () => {
  const isCollapsed = useState<boolean>('sidebar-collapsed', () => {
    if (process.client) {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  const toggle = () => {
    isCollapsed.value = !isCollapsed.value;
    if (process.client) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed.value));
    }
  };

  const collapse = () => {
    isCollapsed.value = true;
    if (process.client) {
      localStorage.setItem('sidebar-collapsed', 'true');
    }
  };

  const expand = () => {
    isCollapsed.value = false;
    if (process.client) {
      localStorage.setItem('sidebar-collapsed', 'false');
    }
  };

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
  };
};

