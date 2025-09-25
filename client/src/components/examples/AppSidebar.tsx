import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppSidebarExample() {
  const handleAddGoal = () => {
    console.log('Add goal triggered from sidebar');
  };

  const handleAddWorkout = () => {
    console.log('Add workout triggered from sidebar');
  };

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar onAddGoal={handleAddGoal} onAddWorkout={handleAddWorkout} />
        <div className="flex-1 flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Main content area</p>
        </div>
      </div>
    </SidebarProvider>
  );
}