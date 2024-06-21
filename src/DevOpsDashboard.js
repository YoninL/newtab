import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui";
import { Button } from "./components/ui";
import { Input } from "./components/ui";
import { Grid, Plus, X, Edit, Save } from "lucide-react";

const ToolCard = ({ tool, onEdit, onDelete }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{tool.title}</CardTitle>
      <div>
        <Button variant="ghost" size="icon" onClick={() => onEdit(tool)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(tool.id)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground">{tool.description}</p>
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-500 hover:text-blue-700 transition-colors mt-2 inline-block"
      >
        Open Tool
      </a>
    </CardContent>
  </Card>
);

const ToolForm = ({ tool, onSave, onCancel }) => {
  const [formData, setFormData] = useState(tool || { title: '', description: '', url: '', groupId: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="title" value={formData.title} onChange={handleChange} placeholder="Tool Title" required />
      <Input name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
      <Input name="url" value={formData.url} onChange={handleChange} placeholder="URL" required />
      <Input name="groupId" value={formData.groupId} onChange={handleChange} placeholder="Group ID" required />
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

const DevOpsDashboard = () => {
  const [tools, setTools] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingTool, setEditingTool] = useState(null);
  const [isAddingTool, setIsAddingTool] = useState(false);

  useEffect(() => {
    const savedTools = JSON.parse(localStorage.getItem('devopsTools')) || [];
    const savedGroups = JSON.parse(localStorage.getItem('devopsGroups')) || [];
    setTools(savedTools);
    setGroups(savedGroups);
  }, []);

  const saveToLocalStorage = (newTools, newGroups) => {
    localStorage.setItem('devopsTools', JSON.stringify(newTools));
    localStorage.setItem('devopsGroups', JSON.stringify(newGroups));
  };

  const handleSaveTool = (toolData) => {
    let newTools;
    if (toolData.id) {
      newTools = tools.map(t => t.id === toolData.id ? toolData : t);
    } else {
      newTools = [...tools, { ...toolData, id: Date.now().toString() }];
    }
    setTools(newTools);
    saveToLocalStorage(newTools, groups);
    setEditingTool(null);
    setIsAddingTool(false);
  };

  const handleDeleteTool = (id) => {
    const newTools = tools.filter(t => t.id !== id);
    setTools(newTools);
    saveToLocalStorage(newTools, groups);
  };

  const handleAddGroup = () => {
    const groupName = prompt("Enter new group name:");
    if (groupName) {
      const newGroups = [...groups, { id: Date.now().toString(), name: groupName }];
      setGroups(newGroups);
      saveToLocalStorage(tools, newGroups);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Grid className="mr-2" /> DevOps Dashboard
      </h1>
      <Button onClick={() => setIsAddingTool(true)} className="mb-4">
        <Plus className="mr-2 h-4 w-4" /> Add Tool
      </Button>
      <Button onClick={handleAddGroup} className="mb-4 ml-2">
        <Plus className="mr-2 h-4 w-4" /> Add Group
      </Button>
      {(isAddingTool || editingTool) && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <ToolForm
              tool={editingTool}
              onSave={handleSaveTool}
              onCancel={() => {
                setEditingTool(null);
                setIsAddingTool(false);
              }}
            />
          </CardContent>
        </Card>
      )}
      {groups.map(group => (
        <div key={group.id} className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{group.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools
              .filter(tool => tool.groupId === group.id)
              .map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onEdit={setEditingTool}
                  onDelete={handleDeleteTool}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DevOpsDashboard;
