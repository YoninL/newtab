import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui";
import { Button } from "./components/ui";
import { Input } from "./components/ui";
import { Grid, Plus, X, Edit, Save, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const ToolCard = ({ tool, onEdit, onDelete }) => {
  const getFaviconUrl = (url) => {
    try {
      const { hostname } = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${hostname}`;
    } catch (error) {
      return '';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow p-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5">
        <div className="flex items-center">
          <img src={getFaviconUrl(tool.url)} alt="favicon" className="h-4 w-4 mr-2" />
          <CardTitle className="text-xxs font-medium">{tool.title}</CardTitle>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(tool.url, '_blank')}
            className="relative group"
          >
            <ExternalLink className="h-2 w-2" />
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 text-xxs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Open Tool
            </span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(tool)} className="relative group">
            <Edit className="h-2 w-2" />
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 text-xxs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Edit
            </span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(tool.id)} className="relative group">
            <X className="h-2 w-2" />
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 text-xxs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Delete
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-1">
        <p className="text-xxs text-muted-foreground">{tool.description}</p>
      </CardContent>
    </Card>
  );
};

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

const GroupSection = ({ group, tools, onEdit, onDelete }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold mr-2">{group.name}</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
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
  );
};

export default DevOpsDashboard;
