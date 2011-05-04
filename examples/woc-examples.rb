#!/usr/bin/env ruby

require "fileutils"

ex_dir = File.expand_path(File.dirname(__FILE__))

Dir.entries(ex_dir).each do |file|
  if File.file?(file) and File.extname(file) == ".woc"
    FileUtils.rm(file)
  end
end
Dir.entries(ex_dir).each do |dir|
  if File.directory? dir and !dir.match(/^\.+$/)
    system "zip -r -9 #{dir}.woc #{dir}"
  end
end
