import {
  getDocs,
  collection,
  addDoc,
  doc,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import { firebaseConfig } from "./firebase";
import { initializeApp } from "firebase/app";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const addStickLocation = async (lat, lon) => {
  const stickLocationCollectionRef = collection(db, "stick-location");
  try {
    const docRef = await addDoc(stickLocationCollectionRef, { lat, lon });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    return false;
  }
};

export const getStickLocations = async () => {
  const stickLocationCollectionRef = collection(db, "stick-location");
  const querySnapshot = await getDocs(stickLocationCollectionRef);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const delStickLocation = async (cId) => {
  const docRef = doc(db, "stick-location", cId);

  try {
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting document: ", error);
    return false;
  }
};
