import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui";
import { Button } from "./components/ui";
import { Input } from "./components/ui";
import { Grid, Plus, X, Edit, Save, ChevronDown, ChevronUp } from "lucide-react";

const ToolCard = ({ tool, onEdit, onDelete }) => (
  <Card className="h-full hover:shadow-md transition-shadow">
    <CardHeader className="p-4">
      <CardTitle className="text-sm font-medium flex justify-between items-center">
        {tool.title}
        <div>
          <Button variant="ghost" size="icon" onClick={() => onEdit(tool)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(tool.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
      >
        Open Tool
      </a>
    </CardContent>
  </Card>
);

const ToolForm = ({ tool, onSave, onCancel, groups }) => {
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
      <select 
        name="groupId" 
        value={formData.groupId} 
        onChange={handleChange} 
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
        required
      >
        <option value="">Select a Group</option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>{group.name}</option>
        ))}
      </select>
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
  const [collapsedGroups, setCollapsedGroups] = useState({});

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

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups(prevState => ({
      ...prevState,
      [groupId]: !prevState[groupId]
    }));
  };

  const GroupSection = ({ group, tools, onEdit, onDelete }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
  
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">{group.name}</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        {!isCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools
              .filter(tool => tool.groupId === group.id)
              .map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Grid className="mr-2" /> DevOps Dashboard
        </h1>
        <div className="flex space-x-4 mb-6">
          <Button onClick={() => setIsAddingTool(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Tool
          </Button>
          <Button onClick={handleAddGroup}>
            <Plus className="mr-2 h-4 w-4" /> Add Group
          </Button>
        </div>
        {(isAddingTool || editingTool) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <ToolForm
                tool={editingTool}
                groups={groups}
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
          <GroupSection
            key={group.id}
            group={group}
            tools={tools}
            onEdit={setEditingTool}
            onDelete={handleDeleteTool}
          />
        ))}
      </div>
    </div>
  );
};

export default DevOpsDashboard;
