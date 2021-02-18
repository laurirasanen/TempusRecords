"Resource/UI/EnemyCountPanel.res"
{	
	"EnemyCountPanel"
	{
		"ControlName"	"EditablePanel"
		"fieldName"		"EnemyCountPanel"
		"xpos"			"0"
		"ypos"			"0"
		"zpos"			"3"
		"wide"			"22"
		"tall"			"36"
		"visible"		"0"
		"enabled"		"1"
        
        if_verbose
		{
			"xpos"		"40"
		}
	}
	
	"EnemyCountImage"
	{
		"ControlName"	"CTFImagePanel"
		"fieldName"		"EnemyCountImage"
		"xpos"			"5"
		"ypos"			"7"
		"zpos"			"3"
		"wide"			"14"
		"tall"			"14"
		"visible"		"1"
		"enabled"		"1"
		"scaleImage"	"1"
        
        if_verbose
		{
			"xpos"		"5"
		}
	}
	
	"EnemyCountImageBG"
	{
		"ControlName"	"Panel"
		"fieldName"		"EnemyCountImageBG"
		"xpos"			"3"
		"ypos"			"4"
		"zpos"			"3"
		"wide"			"19"
		"tall"			"19"
		"visible"		"1"
		"enabled"		"1"
		"PaintBackground" "2"
	}

	"EnemyCountImageBG2"
	{
		"ControlName"	"Panel"
		"fieldName"		"EnemyCountImageBG2"
		"xpos"			"3"
		"ypos"			"4"
		"zpos"			"3"
		"wide"			"19"
		"tall"			"19"
		"visible"		"1"
		"enabled"		"1"
		"PaintBackground" "2"
	}
	
	"EnemyCountCritImageBG"
	{
		"ControlName"	"CTFImagePanel"
		"fieldName"		"EnemyCountCritImageBG"
		"xpos"			"3"
		"ypos"			"4"
		"zpos"			"4"
		"wide"			"19"
		"tall"			"19"
		"visible"		"1"
		"enabled"		"1"
		"scaleImage"	"1"
        "image" "replay/thumbnails/mvm_crit"
		"PaintBackground" "1"
		
	}
	"EnemyCount"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"EnemyCount"
		"font"			"MediumNumbers10"
		"fgcolor"		"White"
		"xpos"			"2"
		"ypos"			"21"
		"ypos_minmode"	"22"
		"zpos"			"3"
		"wide"			"21"
		"tall"			"14"
		"visible"		"1"
		"enabled"		"1"
		"textAlignment"	"center"
		"labelText"		"%enemy_count%"
        
        if_verbose
		{
			"xpos"		"40"
		}
	}
}
