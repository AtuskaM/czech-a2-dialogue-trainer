# RDM design — local review

Not approved for publication. Do not push this design until the teacher reviews it.

Assets: `assets/stars.jpg` and `assets/rdm-logo.png` are unchanged copies of supplied artwork. The logo uses a CSS filter for an antique-gold appearance. `assets/rdm-mascot.png` is a transparent cutout made with the built-in image generation tool from the supplied mascot reference.

Generation prompt: Preserve the recognizable turquoise creature, amber eyes, cream muzzle, orange ears, tail and paws. Remove the frame, parchment, flowers and background. Full-body portrait cutout leaning right with paws embracing an invisible panel edge. Preserve the original friendly expression and illustrated style. Follow-up edit: remove the entire background to genuine alpha transparency, preserving the creature unchanged.

Desktop mascot dimensions use viewport units, independently of document height. Its overlay does not intercept mouse or touch input. On phones it becomes a compact header mascot to retain usable space for the speaking trainer. Existing dialogue content, answer feedback and navigation remain unchanged.

Desktop verification: all assets loaded; no horizontal overflow; expanding help increased panel height from 859.5px to 1427.5px while mascot remained 648px.
