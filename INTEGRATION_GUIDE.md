# Demon Wedge Grouped Selector Upgrade

This organizes the Forge Queue picker for both desktop and iPhone/mobile.

No offline fallback, Supabase, or push-notification files are included.

## Copy this file

```txt
src/components/DemonWedgeGroupedSelector.tsx
```

## Update Forge Queue

Open:

```txt
src/app/forge-queue/page.tsx
```

Add this import:

```tsx
import DemonWedgeGroupedSelector from "@/components/DemonWedgeGroupedSelector";
```

Find the old forge item select dropdown:

```tsx
<select
  value={selectedRecipeId}
  onChange={(event) => setSelectedRecipeId(event.target.value)}
>
  {filteredRecipes.map((recipe) => (
    <option key={recipe.id} value={recipe.id}>
      ...
    </option>
  ))}
</select>
```

Replace that select with:

```tsx
<DemonWedgeGroupedSelector
  recipes={filteredRecipes}
  selectedRecipeId={selectedRecipeId}
  onChange={setSelectedRecipeId}
/>
```

## Recommended Start New Forge layout

Replace your top controls layout with:

```tsx
<div className="grid gap-3 xl:grid-cols-[1fr_1fr_auto]">
  <input
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    placeholder="Search weapon, material, or Demon Wedge..."
    className="rounded-xl bg-zinc-800 p-3 text-white outline-none ring-1 ring-zinc-700 focus:ring-zinc-500"
  />

  <select
    value={categoryFilter}
    onChange={(event) => setCategoryFilter(event.target.value)}
    className="rounded-xl bg-zinc-800 p-3 text-white outline-none ring-1 ring-zinc-700 focus:ring-zinc-500"
  >
    <option value="All">All categories</option>

    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>

  <button
    type="button"
    onClick={startForge}
    disabled={!selectedRecipeId}
    className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Start Forge
  </button>
</div>

<div className="mt-4">
  <DemonWedgeGroupedSelector
    recipes={filteredRecipes}
    selectedRecipeId={selectedRecipeId}
    onChange={setSelectedRecipeId}
  />
</div>
```

## Result

Desktop:
- accordion groups
- selected item preview
- material preview

Mobile/iPhone:
- grouped native selector
- bigger touch target
- easier navigation
