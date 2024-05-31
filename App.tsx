import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {

  apiKey: "AIzaSyAEffDiUrHj0NlxIldgjBhsR8_OMGBJ3TM",
  authDomain: "tdbddfirebase.firebaseapp.com",
  projectId: "tdbddfirebase",
  storageBucket: "tdbddfirebase.appspot.com",
  messagingSenderId: "71119208205",
  appId: "1:71119208205:web:c4235d13d3e3c3cfa3ba44",
  measurementId: "G-071GMGHYP0"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const App = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [editedTaskDescription, setEditedTaskDescription] = useState('');

  useEffect(() => {
    loadProfile();
    loadTasks();
  }, []);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('profile');
      if (storedProfile !== null) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading profile from AsyncStorage:', error);
    }
  };

  const saveProfile = async () => {
    try {
      const newProfile = { email, username };
      await AsyncStorage.setItem('profile', JSON.stringify(newProfile));
      setProfile(newProfile);

      const db = getFirestore();
      await setDoc(doc(db, 'profiles', newProfile.email), newProfile);
    } catch (error) {
      console.error('Error saving profile to AsyncStorage or Firestore:', error);
    }
  };

  const saveTask = async () => {
    try {
      const newTask = { name: taskName, description: taskDescription, email: profile.email };
      const updatedTasks = [...tasks, newTask];
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      const db = getFirestore();
      await setDoc(doc(db, 'tasks', newTask.name), newTask);
      setTaskName('');
      setTaskDescription('');
    } catch (error) {
      console.error('Error saving task to AsyncStorage or Firestore:', error);
    }
  };

  const deleteTask = async (taskName) => {
    try {
      const updatedTasks = tasks.filter(task => task.name !== taskName);
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);

      const db = getFirestore();
      await deleteDoc(doc(db, 'tasks', taskName));
    } catch (error) {
      console.error('Error deleting task from AsyncStorage or Firestore:', error);
    }
  };

  const startEditingTask = (task) => {
    setEditingTask(task);
    setEditedTaskName(task.name);
    setEditedTaskDescription(task.description);
  };

  const saveEditedTask = async () => {
    try {
      const db = getFirestore();

      if (editingTask.name !== editedTaskName) {

        await deleteDoc(doc(db, 'tasks', editingTask.name));


        const updatedTask = { name: editedTaskName, description: editedTaskDescription, email: profile.email };
        await setDoc(doc(db, 'tasks', editedTaskName), updatedTask);


        const updatedTasks = tasks.map(task =>
          task.name === editingTask.name
            ? updatedTask
            : task
        );
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
      } else {

        await setDoc(doc(db, 'tasks', editedTaskName), {
          name: editedTaskName,
          description: editedTaskDescription,
          email: profile.email
        });


        const updatedTasks = tasks.map(task =>
          task.name === editingTask.name
            ? { ...task, name: editedTaskName, description: editedTaskDescription }
            : task
        );
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
      }

      setEditingTask(null);
      setEditedTaskName('');
      setEditedTaskDescription('');
    } catch (error) {
      console.error('Error editing task in AsyncStorage or Firestore:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks from AsyncStorage:', error);
    }
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem('profile');
      setProfile(null);
    } catch (error) {
      console.error('Error clearing profile from AsyncStorage:', error);
    }
  };

  const renderCreateProfileForm = () => {
    return (
      <View>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <Button title="Create Profile" onPress={saveProfile} />
      </View>
    );
  };

  const renderProfileDetails = () => {
    return (
      <View>
        <Text>Email: {profile.email}</Text>
        <Text>Username: {profile.username}</Text>
        <Button title="Back" onPress={clearProfile} />
      </View>
    );
  };

  const renderCreateTaskForm = () => {
    return (
      <View>
        <TextInput
          placeholder="Task Name"
          value={taskName}
          onChangeText={setTaskName}
          style={styles.input}
        />
        <TextInput
          placeholder="Task Description"
          value={taskDescription}
          onChangeText={setTaskDescription}
          style={styles.input}
        />
        <Button
          title="Save Task"
          onPress={saveTask}
          color="green"
        />
      </View>
    );
  };

  const renderTaskList = () => {
    return tasks.map((task, index) => (
      <View key={index} style={styles.task}>
        {editingTask && editingTask.name === task.name ? (
          <View>
            <TextInput
              placeholder="Task Name"
              value={editedTaskName}
              onChangeText={setEditedTaskName}
              style={styles.input}
            />
            <TextInput
              placeholder="Task Description"
              value={editedTaskDescription}
              onChangeText={setEditedTaskDescription}
              style={styles.input}
            />
            <Button title="Save Changes" onPress={saveEditedTask} />
            <Button title="Cancel" onPress={() => setEditingTask(null)} />
          </View>
        ) : (
          <View>
            <Text>Task Name: {task.name}</Text>
            <Text>Task Description: {task.description}</Text>
            <Button title="Modify Task" onPress={() => startEditingTask(task)} />
            <Button title="Delete Task" onPress={() => deleteTask(task.name)} color="red" />
          </View>
        )}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.title2}>Please create a new profile to start organizing your day</Text>
      {profile ? (
        <View>
          {renderProfileDetails()}
          {renderCreateTaskForm()}
          {renderTaskList()}
        </View>
      ) : (
        renderCreateProfileForm()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: 300,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  task: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    width: 300,
  },
  saveButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
