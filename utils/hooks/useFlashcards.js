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
      .eq("owner_id", userId)
      .order("index", { ascending: true });
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
        console.log("Error creating user progress:", createError);
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

    // Get the highest current index
    const { data: maxIndexData, error: maxIndexError } = await supabase
      .from('collections')
      .select('index')
      .eq('owner_id', userId)
      .order('index', { ascending: false })
      .limit(1)
      .single();

    if (maxIndexError && maxIndexError.code !== 'PGRST116') { // Ignore 'no rows found' error
        console.error('Error fetching max index:', maxIndexError);
        return null;
    }

    const newIndex = (maxIndexData?.index || 0) + 1;

    const { data: collection, error } = await supabase
      .from("collections")
      .insert([{ name, owner_id: userId, pinned: false, index: newIndex }])
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
      .from("user_progress")
      .update(updatedData)
      .eq("id", progressId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user progress:", error);
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
      .from("collections")
      .update(updatedData)
      .eq("id", collectionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating collection:", error);
      return null;
    }

    return data;
  };

  const updateCard = async (cardId, updatedData) => {
    if (!cardId) {
      console.error("Card ID is required to update a card.");
      return null;
    }

    const { data, error } = await supabase
      .from("cards")
      .update(updatedData)
      .eq("id", cardId)
      .select()
      .single();

    if (error) {
      console.error("Error updating card:", error);
      return null;
    }

    return data;
  };

  const deleteCard = async (cardId) => {
    if (!cardId) {
      console.error("Card ID is required to delete a card.");
      return null;
    }

    const { data, error } = await supabase
      .from("cards")
      .delete()
      .eq("id", cardId)
      .select()
      .single();

    if (error) {
      console.error("Error deleting card:", error);
      return null;
    }

    return data; // returns the deleted card
  };

  const deleteCollection = async (collectionId) => {
    if (!collectionId) {
      console.error("Collection ID is required to delete a collection.");
      return null;
    }

    // Step 1: Get all sets in the collection
    const { data: sets, error: setsError } = await supabase
      .from("sets")
      .select("id")
      .eq("collection_id", collectionId);

    if (setsError) {
      console.error("Error fetching sets for collection:", setsError);
      return null;
    }

    // Step 2: Delete each set (and its cards) using deleteSet
    for (const set of sets) {
      const deletedSet = await deleteSet(set.id);
      if (!deletedSet) {
        console.error(`Failed to delete set with id: ${set.id}`);
        return null;
      }
    }

    // Step 3: Delete the collection itself
    const { data, error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId)
      .select()
      .single();

    if (error) {
      console.error("Error deleting collection:", error);
      return null;
    }

    return data; // returns the deleted collection
  };

    const deleteSet = async (setId) => {
      if (!setId) {
        console.error("Set ID is required to delete a set.");
        return null;
      }

      // Step 1: Delete related cards
      const { error: cardsError } = await supabase
        .from("cards")
        .delete()
        .eq("set_id", setId);

      if (cardsError) {
        console.error("Error deleting related cards:", cardsError);
        return null;
      }

      // Step 2: Delete related user progress
      const { error: progressError } = await supabase
        .from("user_progress")
        .delete()
        .eq("set_id", setId);

      if (progressError) {
        console.error("Error deleting related user progress:", progressError);
        return null;
      }

      // Step 3: Delete the set itself
      const { data, error } = await supabase
        .from("sets")
        .delete()
        .eq("id", setId)
        .select()
        .single();

      if (error) {
        console.error("Error deleting set:", error);
        return null;
      }

      return data; // returns the deleted set
    };


  const updateSet = async (setId, setData, cardList) => {
    if (!setId) {
      console.error("Set ID is required to update a set.");
      return null;
    }

    // 1. Update the set's own data (name, collection_id)
    const { data: updatedSet, error: setUpdateError } = await supabase
      .from("sets")
      .update(setData)
      .eq("id", setId)
      .select()
      .single();

    if (setUpdateError) {
      console.error("Error updating set:", setUpdateError);
      return null;
    }

    // 2. Delete all existing cards for the set
    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('set_id', setId);

    if (deleteError) {
        console.error('Error deleting old cards:', deleteError);
        return null;
    }

    // 3. Insert the new list of cards
    if (cardList && cardList.length > 0) {
        const newCardData = cardList.map((card, index) => ({
            set_id: setId,
            front: card.front,
            back: card.back,
            index: index,
        }));

        const { error: insertError } = await supabase.from("cards").insert(newCardData);

        if (insertError) {
            console.error("Error inserting new cards:", insertError);
            return null;
        }
    }

    return updatedSet;
  };

  const updateCollectionOrder = async (updates) => {
    if (!updates || updates.length === 0) {
      return null;
    }

    // RLS policies work best with explicit updates rather than a broad upsert.
    // We run all update promises in parallel for efficiency.
    const updatePromises = updates.map((item) =>
      supabase
        .from("collections")
        .update({ index: item.index })
        .eq("id", item.id)
    );

    const results = await Promise.all(updatePromises);

    const firstError = results.find((result) => result.error);
    if (firstError) {
      console.error("Error updating collection order:", firstError.error);
      return null;
    }

    return results.map((result) => result.data);
  };

  const toggleSetFlipped = async (setId) => {
    if (!setId) {
      console.error("Set ID is required to toggle the flipped state.");
      return null;
    }

    // First, get the current value of 'flipped'
    const { data: set, error: fetchError } = await supabase
      .from("sets")
      .select("flipped")
      .eq("id", setId)
      .single();

    if (fetchError) {
      console.error("Error fetching set's flipped state:", fetchError);
      return null;
    }

    // Toggle the value
    const newFlippedState = !set.flipped;

    // Update the 'flipped' value in the database
    const { data: updatedSet, error: updateError } = await supabase
      .from("sets")
      .update({ flipped: newFlippedState })
      .eq("id", setId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating set's flipped state:", updateError);
      return null;
    }

    return updatedSet;
  };

  return {
    getCollections,
    getSet,
    getUserProgress,
    createSet,
    createCollection,
    updateUserProgress,
    updateCollection,
    updateCard,
    deleteCard,
    deleteCollection,
    deleteSet,
    updateSet,
    updateCollectionOrder,
    toggleSetFlipped,
  };
};
