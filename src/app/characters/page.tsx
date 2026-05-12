"use client";

import { useEffect, useState } from "react";

import { characters as defaultCharacters } from "@/data/characters";

import type { Character } from "@/lib/types";

export default function CharactersPage() {
  const [characters, setCharacters] =
    useState<Character[]>(defaultCharacters);

  useEffect(() => {
    const saved = localStorage.getItem("characters");

    if (saved) {
      setCharacters(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "characters",
      JSON.stringify(characters)
    );
  }, [characters]);

  function toggleOwned(id: string) {
    setCharacters((prev) =>
      prev.map((character) =>
        character.id === id
          ? {
              ...character,
              owned: !character.owned,
            }
          : character
      )
    );
  }

  function toggleCompleted(id: string) {
    setCharacters((prev) =>
      prev.map((character) =>
        character.id === id
          ? {
              ...character,
              completed: !character.completed,
            }
          : character
      )
    );
  }

  function updateCharacterLevel(
    id: string,
    value: number
  ) {
    setCharacters((prev) =>
      prev.map((character) =>
        character.id === id
          ? {
              ...character,
              characterLevel: value,
            }
          : character
      )
    );
  }

  function updateIntronLevel(
    id: string,
    value: number
  ) {
    setCharacters((prev) =>
      prev.map((character) =>
        character.id === id
          ? {
              ...character,
              intronLevel: value,
            }
          : character
      )
    );
  }

  function updateNotes(
    id: string,
    value: string
  ) {
    setCharacters((prev) =>
      prev.map((character) =>
        character.id === id
          ? {
              ...character,
              notes: value,
            }
          : character
      )
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <h1 className="mb-6 text-3xl font-bold">
        Character Tracker
      </h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {characters.map((character) => (
          <section
            key={character.id}
            className="rounded-2xl bg-zinc-900 p-5 shadow-lg"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                {character.name}
              </h2>

              <p className="text-zinc-400">
                Element: {character.element}
              </p>

              <p className="text-sm text-zinc-500">
                {character.source}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <input
                  type="checkbox"
                  checked={character.owned}
                  onChange={() =>
                    toggleOwned(character.id)
                  }
                />{" "}
                Owned
              </label>

              <label className="block">
                <input
                  type="checkbox"
                  checked={character.completed}
                  onChange={() =>
                    toggleCompleted(character.id)
                  }
                />{" "}
                Completed Build
              </label>

              <div>
                <label className="mb-1 block text-sm">
                  Character Level
                </label>

                <input
                  type="number"
                  min="1"
                  max="100"
                  value={character.characterLevel}
                  onChange={(e) =>
                    updateCharacterLevel(
                      character.id,
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg bg-zinc-800 p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">
                  Intron Level
                </label>

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={character.intronLevel}
                  onChange={(e) =>
                    updateIntronLevel(
                      character.id,
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg bg-zinc-800 p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">
                  Notes
                </label>

                <textarea
                  value={character.notes}
                  onChange={(e) =>
                    updateNotes(
                      character.id,
                      e.target.value
                    )
                  }
                  className="min-h-[100px] w-full rounded-lg bg-zinc-800 p-2"
                  placeholder="Build notes, farming goals, etc..."
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
