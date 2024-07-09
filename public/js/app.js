// app.js

window.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();
  
    const $ = go.GraphObject.make;
    const myDiagram = $(go.Diagram, "myDiagramDiv", {
      "undoManager.isEnabled": true
    });
  
    myDiagram.nodeTemplate =
      $(go.Node, "Auto",
        $(go.Shape, "RoundedRectangle", { strokeWidth: 0 },
          new go.Binding("fill", "color")),
        $(go.TextBlock,
          { margin: 8, editable: true },
          new go.Binding("text").makeTwoWay())
      );
  
    // Function to update the flowchart with new data
    function updateFlowchart(data) {
      if (!data || !Array.isArray(data.nodeDataArray) || !Array.isArray(data.linkDataArray)) {
        console.error('Invalid data format:', data);
        return;
      }
  
      const nodes = data.nodeDataArray.map(node => ({
        key: node.key,
        text: node.text,
        color: node.color || "lightblue" // Default color if not provided
      }));
  
      const links = data.linkDataArray.map(link => ({
        from: link.from,
        to: link.to
      }));
  
      myDiagram.model = new go.GraphLinksModel(nodes, links);
    }
  
    // Event listener for receiving updated flowchart data from server
    socket.on('newFlowchart', function (data) {
      updateFlowchart(data);
    });
  
    // Handle form submission for JSON upload
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission
  
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];
  
      if (!file) return;
  
      try {
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
  
        if (response.ok) {
          const data = await response.json();
          updateFlowchart(data); // Update flowchart with uploaded data
        } else {
          console.error('Failed to upload JSON file:', response.statusText);
        }
      } catch (error) {
        console.error('Error uploading JSON file:', error);
      }
    });
  });
  