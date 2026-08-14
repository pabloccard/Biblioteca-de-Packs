link_path = 'src/components/LinkButton.tsx'
content = open(link_path).read()

old_logic = "const isPS = tag?.toLowerCase() === 'psd' || tag?.toLowerCase() === 'photoshop' || cleanLabel.toLowerCase().includes('psd')"
new_logic = "const isPS = tag?.toLowerCase() === 'psd' || tag?.toLowerCase() === 'photoshop' || cleanLabel.toLowerCase().includes('psd') || cleanLabel.toLowerCase().includes('photoshop')"

content = content.replace(old_logic, new_logic)

open(link_path, 'w').write(content)
print("Updated isPS logic to include 'photoshop'")
