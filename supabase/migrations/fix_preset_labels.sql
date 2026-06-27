-- Fix left/right labels on default angle presets (yaw sign was inverted)
update public.angle_presets set label = '斜め30°左' where is_default = true and yaw =  30;
update public.angle_presets set label = '斜め45°左' where is_default = true and yaw =  45;
update public.angle_presets set label = '斜め30°右' where is_default = true and yaw = -30;
update public.angle_presets set label = '斜め45°右' where is_default = true and yaw = -45;
