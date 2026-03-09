document.addEventListener('DOMContentLoaded', () => {
  const addChannelBtn = document.getElementById("addChannel");
  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const tokenInput = document.getElementById("token");
  const webhookInput = document.getElementById("webhook");
  const channelsContainer = document.getElementById("channelsContainer");

  // Event Listeners
  addChannelBtn.addEventListener("click", () => addChannel());
  generateBtn.addEventListener("click", generateJSON);
  copyBtn.addEventListener("click", copyJSON);
  
  // Real-time binding for token & webhook
  tokenInput.addEventListener("input", updatePreview);
  webhookInput.addEventListener("input", updatePreview);

  // Add default channel on load
  addChannel();

  function addChannel(id = "", message = "", delay = 1) {
    const group = document.createElement("div");
    group.className = "channel-group";

    group.innerHTML = `
      <button type="button" class="btn-remove" aria-label="Remove channel" title="Remove channel">
        <i class="fas fa-times"></i>
      </button>
      <div class="input-group">
        <label>Channel ID</label>
        <div class="input-wrapper">
          <i class="fas fa-hashtag icon"></i>
          <input type="text" class="channel-id" value="${id}" placeholder="Enter channel ID" required>
        </div>
      </div>

      <div class="input-group">
        <label>Message</label>
        <textarea class="channel-message" placeholder="Type your message here..." required>${message}</textarea>
      </div>

      <div class="input-group" style="margin-bottom: 0;">
        <label>Delay in Minutes</label>
        <div class="input-wrapper">
          <i class="fas fa-clock icon"></i>
          <input type="number" class="channel-delay" value="${delay}" required min="1">
        </div>
      </div>
    `;

    // Attach listeners dynamically
    const idInput = group.querySelector(".channel-id");
    const msgInput = group.querySelector(".channel-message");
    const delayInput = group.querySelector(".channel-delay");
    
    idInput.addEventListener("input", updatePreview);
    msgInput.addEventListener("input", updatePreview);
    delayInput.addEventListener("input", updatePreview);

    // Remove functionality with exit animation
    group.querySelector(".btn-remove").addEventListener("click", () => {
      // Animate out
      group.style.transform = 'scale(0.95)';
      group.style.opacity = '0';
      setTimeout(() => {
        group.remove();
        updatePreview();
      }, 300);
    });

    channelsContainer.appendChild(group);
    
    // Focus new id input slightly after animation starts
    setTimeout(() => {
      if(!idInput.value) idInput.focus();
    }, 100);

    updatePreview();
  }

  function updatePreview() {
    const token = tokenInput.value;
    const webhook = webhookInput.value;

    const channels = Array.from(document.querySelectorAll(".channel-group")).map(group => ({
      id: group.querySelector('.channel-id').value,
      message: group.querySelector('.channel-message').value,
      delay_in_minutes: parseInt(group.querySelector('.channel-delay').value) || 1
    }));

    let preview = `{\n`;
    preview += `  "token": "${token}",\n`;
    preview += `  "channels": [\n`;

    channels.forEach((channel, index) => {
      // Escape backslashes and quotes
      const escapedMessage = channel.message.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      preview += `    {\n`;
      preview += `      "id": "${channel.id}",\n`;
      preview += `      "message": """${escapedMessage}""",\n`;
      preview += `      "delay_in_minutes": ${channel.delay_in_minutes}\n`;
      preview += `    }${index < channels.length - 1 ? "," : ""}\n`;
    });

    preview += `  ],\n`;
    preview += `  "webhook_url": "${webhook}"\n`;
    preview += `}`;

    const jsonPreview = document.getElementById("jsonPreview");
    
    // Check if changed
    if (jsonPreview.textContent !== preview) {
      jsonPreview.textContent = preview;
      // Small pulse animation on update
      jsonPreview.style.opacity = '0.5';
      setTimeout(() => {
          jsonPreview.style.opacity = '1';
      }, 150);
    }
  }

  function generateJSON() {
    const content = document.getElementById("jsonPreview").textContent;
    const blob = new Blob([content], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "config.json";
    link.click();
    
    // Animate button
    generateBtn.innerHTML = '<i class="fas fa-check"></i> Generated!';
    generateBtn.style.background = 'var(--success)';
    setTimeout(() => {
      generateBtn.innerHTML = '<i class="fas fa-download"></i> Generate JSON';
      generateBtn.style.background = '';
    }, 2000);
  }

  function copyJSON() {
    const json = document.getElementById("jsonPreview").textContent;
    navigator.clipboard.writeText(json).then(() => {
      // Animate button
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
      copyBtn.style.color = 'var(--success)';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.color = '';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
});
