import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

export const useFlashcards = () => {
  const supabase = createClient();

  const getCollections = async (userId) => {
    if (!userId) {
      console.error("User ID is required to fetch collections.");
      return null;
    }
    const { data: collections, error } = await supabase
      .from("collections")
      .select("id, name, pinned, sets(name, id)")
      .eq("owner_id", userId);
    if (error) {
      console.error("Error fetching collections:", error);
      return null;
    }
    return collections;
  };

  const getSet = async (id) => {
    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .eq("set_id", id)
      .order("index", { ascending: true });
    if (error) {
      console.error("Error fetching set:", error);
      return null;
    }
    const { data: set, error: setError } = await supabase
      .from("sets")
      .select("*, collections(name)")
      .eq("id", id)
      .single();

    if (setError) {
      console.error("Error fetching set info:", setError);
      return null;
    }

    const { collections, ...info } = set;

    let setData = {
      cards: cards,
      info: { ...info, collection_name: collections?.name },
    };
    return setData;
  };

  const getUserProgress = async (setId, userId) => {
    let { data: progress, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("set_id", setId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error fetching user progress:", error);
      return null;
    }

    if (!progress) {
      // Progress does not exist, so create it
      const setData = await getSet(setId);
      if (!setData || !setData.cards) {
        console.error("Could not fetch cards to create initial progress.");
        return null;
      }

      const newProgress = {
        user_id: userId,
        set_id: setId,
        round: 0,
        history: [],
        piles: {
          main: setData.cards,
          know: [],
          dontKnow: [],
          discard: [],
        },
      };

      const { data: createdProgress, error: createError } = await supabase
        .from("user_progress")
        .insert(newProgress)
        .select()
        .single();

      if (createError) {
        console.error("Error creating user progress:", createError);
        return null;
      }
      return createdProgress;
    }

    return progress;
  };

  const createSet = async (name, collectionId, cards, userId) => {
    if (!userId) {
      console.error("User ID is required to create a set.");
      return null;
    }
    const { data: set, error: setError } = await supabase
      .from("sets")
      .insert([{ name, collection_id: collectionId, owner_id: userId }])
      .select()
      .single();

    if (setError) {
      console.error("Error creating set:", setError);
      return null;
    }

    const cardData = cards.map((card, index) => ({
      set_id: set.id,
      front: card.front,
      back: card.back,
      index: index,
    }));

    const { error: cardsError } = await supabase.from("cards").insert(cardData);

    if (cardsError) {
      console.error("Error inserting cards:", cardsError);
      // Optionally, you might want to delete the set if inserting cards fails
      await supabase.from("sets").delete().eq("id", set.id);
      return null;
    }

    return set;
  };

  const createCollection = async (name, userId) => {
    if (!userId) {
      console.error("User ID is required to create a collection.");
      return null;
    }
    const { data: collection, error } = await supabase
      .from("collections")
      .insert([{ name, owner_id: userId, pinned: false }])
      .select()
      .single();

    if (error) {
      console.error("Error creating collection:", error);
      return null;
    }
    return collection;
  };

  const updateUserProgress = async (progressId, updatedData) => {
    if (!progressId) {
      console.error("Progress ID is required to update progress.");
      return null;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .update(updatedData)
      .eq('id', progressId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user progress:', error);
      return null;
    }

    return data;
  };

  const updateCollection = async (collectionId, updatedData) => {
    if (!collectionId) {
      console.error("Collection ID is required to update a collection.");
      return null;
    }

    const { data, error } = await supabase
      .from('collections')
      .update(updatedData)
      .eq('id', collectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating collection:', error);
      return null;
    }

    return data;
  };

  return {
    getCollections,
    getSet,
    getUserProgress,
    createSet,
    createCollection,
    updateUserProgress,
    updateCollection,
  };
};
