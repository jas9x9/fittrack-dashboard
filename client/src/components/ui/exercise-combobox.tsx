import * as React from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Exercise {
  id: string;
  name: string;
}

interface ExerciseComboboxProps {
  exercises: Exercise[];
  value: string;
  onValueChange: (exerciseId: string) => void;
  onCreateExercise: (name: string) => Promise<Exercise>;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

export function ExerciseCombobox({
  exercises,
  value,
  onValueChange,
  onCreateExercise,
  disabled = false,
  placeholder = "Select exercise",
  error,
}: ExerciseComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedExercise = exercises.find((ex) => ex.id === value);

  // Filter exercises based on search
  const filteredExercises = React.useMemo(() => {
    if (!searchValue.trim()) return exercises;

    const search = searchValue.toLowerCase().trim();
    return exercises.filter((ex) =>
      ex.name.toLowerCase().includes(search)
    );
  }, [exercises, searchValue]);

  // Check if there's an exact match (case-insensitive)
  const hasExactMatch = React.useMemo(() => {
    if (!searchValue.trim()) return false;

    const search = searchValue.toLowerCase().trim();
    return exercises.some((ex) => ex.name.toLowerCase() === search);
  }, [exercises, searchValue]);

  // Show create option when search has no matches and no exact match exists
  const showCreateOption =
    searchValue.trim().length > 0 &&
    filteredExercises.length === 0 &&
    !hasExactMatch;

  const handleCreateExercise = async () => {
    const name = searchValue.trim();
    if (!name || isCreating) return;

    // Validate name length
    if (name.length > 100) {
      console.error("Exercise name too long");
      return;
    }

    setIsCreating(true);
    try {
      const newExercise = await onCreateExercise(name);
      onValueChange(newExercise.id);
      setSearchValue("");
      setOpen(false);
    } catch (error) {
      // Error handled by mutation hook
      console.error("Failed to create exercise:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelect = (exerciseId: string) => {
    onValueChange(exerciseId);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select exercise"
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            error && "border-red-500"
          )}
        >
          {selectedExercise ? selectedExercise.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or add exercise..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredExercises.length === 0 && !showCreateOption && (
              <CommandEmpty>No exercises found.</CommandEmpty>
            )}

            {showCreateOption && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateExercise}
                  disabled={isCreating}
                  className="cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create "{searchValue.trim()}"
                    </>
                  )}
                </CommandItem>
              </CommandGroup>
            )}

            {filteredExercises.length > 0 && (
              <CommandGroup>
                {filteredExercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.id}
                    onSelect={() => handleSelect(exercise.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === exercise.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {exercise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
