<?xml version="1.0"?>
<interface>
  <requires lib="gtk+" version="2.16"/>
  <!-- interface-naming-policy project-wide -->
  <object class="GtkDialog" id="clone_repo">
    <property name="border_width">5</property>
    <property name="type">popup</property>
    <property name="title" translatable="yes">Clone Repsoitory</property>
    <property name="resizable">False</property>
    <property name="window_position">center</property>
    <property name="type_hint">normal</property>
    <property name="has_separator">False</property>
    <child internal-child="vbox">
      <object class="GtkVBox" id="dialog-vbox1">
        <property name="visible">True</property>
        <property name="orientation">vertical</property>
        <property name="spacing">2</property>
        <child>
          <object class="GtkTable" id="table1">
            <property name="visible">True</property>
            <property name="n_rows">2</property>
            <property name="n_columns">2</property>
            <child>
              <object class="GtkLabel" id="label1">
                <property name="visible">True</property>
                <property name="xalign">1</property>
                <property name="label" translatable="yes">server : </property>
              </object>
              <packing>
                <property name="x_options">GTK_FILL</property>
              </packing>
            </child>
            <child>
              <object class="GtkLabel" id="label2">
                <property name="visible">True</property>
                <property name="xalign">1</property>
                <property name="label" translatable="yes">repository : </property>
              </object>
              <packing>
                <property name="top_attach">1</property>
                <property name="bottom_attach">2</property>
                <property name="x_options">GTK_FILL</property>
              </packing>
            </child>
            <child>
              <object class="GtkHBox" id="hbox1">
                <property name="visible">True</property>
                <child>
                  <object class="GtkComboBox" id="combobox1">
                    <property name="visible">True</property>
                  </object>
                  <packing>
                    <property name="position">0</property>
                  </packing>
                </child>
                <child>
                  <object class="GtkButton" id="button1">
                    <property name="visible">True</property>
                    <property name="can_focus">True</property>
                    <property name="receives_default">True</property>
                    <property name="image_position">right</property>
                    <child>
                      <object class="GtkImage" id="image1">
                        <property name="visible">True</property>
                        <property name="stock">gtk-add</property>
                      </object>
                    </child>
                  </object>
                  <packing>
                    <property name="expand">False</property>
                    <property name="position">1</property>
                  </packing>
                </child>
              </object>
              <packing>
                <property name="left_attach">1</property>
                <property name="right_attach">2</property>
              </packing>
            </child>
            <child>
              <object class="GtkComboBox" id="combobox2">
                <property name="visible">True</property>
              </object>
              <packing>
                <property name="left_attach">1</property>
                <property name="right_attach">2</property>
                <property name="top_attach">1</property>
                <property name="bottom_attach">2</property>
              </packing>
            </child>
          </object>
          <packing>
            <property name="expand">False</property>
            <property name="fill">False</property>
            <property name="position">1</property>
          </packing>
        </child>
        <child internal-child="action_area">
          <object class="GtkHButtonBox" id="dialog-action_area1">
            <property name="visible">True</property>
            <property name="layout_style">end</property>
            <child>
              <object class="GtkButton" id="ok">
                <property name="label">gtk-ok</property>
                <property name="visible">True</property>
                <property name="can_focus">True</property>
                <property name="receives_default">True</property>
                <property name="use_stock">True</property>
                <property name="image_position">right</property>
                <signal name="activate" handler="on_ok"/>
              </object>
              <packing>
                <property name="expand">False</property>
                <property name="fill">False</property>
                <property name="position">0</property>
              </packing>
            </child>
            <child>
              <object class="GtkButton" id="cancel">
                <property name="label">gtk-cancel</property>
                <property name="visible">True</property>
                <property name="can_focus">True</property>
                <property name="receives_default">True</property>
                <property name="use_stock">True</property>
                <signal name="activate" handler="on_cancel"/>
              </object>
              <packing>
                <property name="expand">False</property>
                <property name="fill">False</property>
                <property name="position">1</property>
              </packing>
            </child>
          </object>
          <packing>
            <property name="expand">False</property>
            <property name="pack_type">end</property>
            <property name="position">0</property>
          </packing>
        </child>
      </object>
    </child>
    <action-widgets>
      <action-widget response="0">ok</action-widget>
      <action-widget response="2">cancel</action-widget>
    </action-widgets>
  </object>
</interface>
